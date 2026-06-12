package com.example.store_management.service;

import com.example.store_management.model.SchedulerConfig;
import com.example.store_management.repository.OrderRepository;
import com.example.store_management.repository.ProductRepository;
import com.example.store_management.repository.SchedulerConfigRepository;
import com.example.store_management.repository.UserRepository;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.concurrent.ScheduledFuture;

@Service
public class DynamicSchedulerService implements SchedulingConfigurer {

    private final SchedulerConfigRepository schedulerConfigRepository;
    private final OrderService              orderService;
    private final ActiveUserRegistry        activeUserRegistry;
    private final UserRepository            userRepository;
    private final ProductRepository         productRepository;
    private final OrderRepository           orderRepository;
    private final TaskScheduler             taskScheduler;

    private ScheduledFuture<?>     currentTask;
    private ScheduledTaskRegistrar taskRegistrar;

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("HH:mm:ss");

    public DynamicSchedulerService(
            SchedulerConfigRepository schedulerConfigRepository,
            OrderService              orderService,
            ActiveUserRegistry        activeUserRegistry,
            UserRepository            userRepository,
            ProductRepository         productRepository,
            OrderRepository           orderRepository,
            TaskScheduler             taskScheduler) {
        this.schedulerConfigRepository = schedulerConfigRepository;
        this.orderService              = orderService;
        this.activeUserRegistry        = activeUserRegistry;
        this.userRepository            = userRepository;
        this.productRepository         = productRepository;
        this.orderRepository           = orderRepository;
        this.taskScheduler             = taskScheduler;
    }

    /**
     * Called once by Spring on startup.
     * We register nothing here statically — the first real schedule is
     * set by scheduleTask() which is called from the config API or on startup.
     */
    @Override
    public void configureTasks(ScheduledTaskRegistrar registrar) {
        this.taskRegistrar = registrar;
        // Kick off the initial schedule from whatever is in the DB
        scheduleTask();
    }

    /**
     * Cancels the current task (if any) and starts a new one
     * using the interval stored in the database.
     *
     * This is called:
     *   1. On app startup (from configureTasks)
     *   2. Every time the admin updates the scheduler config via the API
     */
    public synchronized void reschedule() {
        if (currentTask != null && !currentTask.isCancelled()) {
            currentTask.cancel(false); // false = let the current run finish
        }
        scheduleTask();
    }

    private void scheduleTask() {
        SchedulerConfig config = getConfig();
        long intervalMs = Duration.ofMinutes(
                config.getOrderLifecycleIntervalMinutes()).toMillis();

        currentTask = taskScheduler.scheduleWithFixedDelay(
                this::runOrderLifecycle, intervalMs);

        System.out.printf(
                "[DynamicScheduler] Task scheduled — running every %d minute(s).%n",
                config.getOrderLifecycleIntervalMinutes());
    }

    /**
     * The actual work that runs on each tick.
     */
    private void runOrderLifecycle() {
        String time   = LocalTime.now().format(FMT);
        SchedulerConfig config = getConfig();

        // ── Process stale orders ──────────────────────────────────────────
        String orderReport = orderService.processStaleOrders(
                config.getPendingCancelAfterMinutes(),
                config.getConfirmedShipAfterMinutes(),
                config.getShippedDeliverAfterMinutes());

        // ── Gather live stats ─────────────────────────────────────────────
        Set<String> online        = activeUserRegistry.getActiveUsers();
        long        totalUsers    = userRepository.count();
        long        totalProducts = productRepository.count();
        int         pending       = orderRepository.countByStatus("PENDING");
        int         confirmed     = orderRepository.countByStatus("CONFIRMED");
        int         shipped       = orderRepository.countByStatus("SHIPPED");
        int         delivered     = orderRepository.countByStatus("DELIVERED");
        int         cancelled     = orderRepository.countByStatus("CANCELLED");
        int         ordersToday   = orderRepository.countOrdersToday();
        double      revenue       = orderRepository.getTotalRevenue();

        // ── Print snapshot ────────────────────────────────────────────────
        System.out.println(
                "\n╔══════════════════════════════════════════════════╗");
        System.out.printf(
                "║  STORE SNAPSHOT  [%s]  (every %d min)       ║%n",
                time, config.getOrderLifecycleIntervalMinutes());
        System.out.println(
                "╠══════════════════════════════════════════════════╣");

        if (online.isEmpty()) {
            System.out.println(
                    "║  👤 Online   : No one logged in                  ║");
        } else {
            System.out.printf(
                    "║  👤 Online   : %-35s║%n",
                    online.size() + " user(s): " + online);
        }

        System.out.printf("║  👥 Users    : %-35s║%n", totalUsers    + " registered");
        System.out.printf("║  📦 Products : %-35s║%n", totalProducts + " in catalogue");
        System.out.println(
                "╠══════════════════════════════════════════════════╣");
        System.out.printf("║  📅 Today    : %-35s║%n", ordersToday + " order(s) placed");
        System.out.printf("║  🕐 Pending  : %-35s║%n",
                pending   + " (cancel after " + config.getPendingCancelAfterMinutes()   + " min)");
        System.out.printf("║  ✅ Confirmed : %-35s║%n",
                confirmed + " (ship after "   + config.getConfirmedShipAfterMinutes()   + " min)");
        System.out.printf("║  🚚 Shipped  : %-35s║%n",
                shipped   + " (deliver after " + config.getShippedDeliverAfterMinutes() + " min)");
        System.out.printf("║  📬 Delivered : %-35s║%n", delivered + " order(s)");
        System.out.printf("║  ❌ Cancelled : %-35s║%n", cancelled + " order(s)");
        System.out.printf("║  💰 Revenue  : $%-34.2f║%n", revenue);
        System.out.println(
                "╠══════════════════════════════════════════════════╣");
        System.out.printf("║  ⚙  Actions  : %-35s║%n", orderReport);
        System.out.println(
                "╚══════════════════════════════════════════════════╝");
    }

    /** Gets the singleton config row, creating it with defaults if absent. */
    public SchedulerConfig getConfig() {
        return schedulerConfigRepository.findById(1L)
                .orElseGet(() -> schedulerConfigRepository.save(new SchedulerConfig()));
    }

    /** Updates the config and reschedules immediately. */
    public SchedulerConfig updateConfig(SchedulerConfig updated) {
        SchedulerConfig config = getConfig();
        config.setOrderLifecycleIntervalMinutes(
                updated.getOrderLifecycleIntervalMinutes());
        config.setPendingCancelAfterMinutes(
                updated.getPendingCancelAfterMinutes());
        config.setConfirmedShipAfterMinutes(
                updated.getConfirmedShipAfterMinutes());
        config.setShippedDeliverAfterMinutes(
                updated.getShippedDeliverAfterMinutes());
        SchedulerConfig saved = schedulerConfigRepository.save(config);
        reschedule(); // ← this is what makes it dynamic
        return saved;
    }
}