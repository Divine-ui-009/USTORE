package com.example.store_management.service;

import com.example.store_management.model.*;
import com.example.store_management.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository    orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository  productRepository;
    private final UserRepository     userRepository;

    public OrderService(OrderRepository    orderRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository  productRepository,
                        UserRepository     userRepository) {
        this.orderRepository    = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository  = productRepository;
        this.userRepository     = userRepository;
    }

    // Convert the user's cart into a confirmed order
    @Transactional
    public Order checkout(String username) {
        User           user      = getUser(username);
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty())
            throw new RuntimeException("Your cart is empty.");

        // Validate stock and calculate total
        double total = 0;
        for (CartItem item : cartItems) {
            Product p = item.getProduct();
            if (!p.getIsAvailable())
                throw new RuntimeException(p.getName() + " is no longer available.");
            if (p.getQuantity() < item.getQuantity())
                throw new RuntimeException("Only " + p.getQuantity()
                        + " of " + p.getName() + " left in stock.");
            total += p.getPrice() * item.getQuantity();
        }

        // Create the order
        Order order = new Order(user, total);
        orderRepository.save(order);

        // Create order items and reduce stock
        for (CartItem item : cartItems) {
            Product p = item.getProduct();

            OrderItem orderItem = new OrderItem(order, p, item.getQuantity());
            order.getItems().add(orderItem);

            p.setQuantity(p.getQuantity() - item.getQuantity());
            // Mark unavailable if stock hits 0
            if (p.getQuantity() == 0) p.setIsAvailable(false);
            productRepository.save(p);
        }

        orderRepository.save(order);

        // Clear the cart
        cartItemRepository.clearCartByUserId(user.getId());

        return order;
    }

    // Get all orders for a user
    public List<Order> getUserOrders(String username) {
        User user = getUser(username);
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // Get all orders (admin)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Update order status (admin)
    @Transactional
    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public double getTotalRevenue() {
        return orderRepository.getTotalRevenue();
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    /**
     * Called by the dynamic scheduler with thresholds loaded from the DB.
     * All timing values come from SchedulerConfig, not hardcoded constants.
     */
    @Transactional
    public String processStaleOrders(int pendingCancelMinutes,
                                     int confirmedShipMinutes,
                                     int shippedDeliverMinutes) {
        LocalDateTime now = LocalDateTime.now();

        // 1. PENDING → CANCELLED if admin hasn't acted within threshold
        List<Order> stalePending = orderRepository.findStaleOrders(
                OrderStatus.PENDING, now.minusMinutes(pendingCancelMinutes));

        int cancelled = 0;
        for (Order order : stalePending) {
            for (OrderItem item : order.getItems()) {
                Product p = item.getProduct();
                p.setQuantity(p.getQuantity() + item.getQuantity());
                p.setIsAvailable(true);
                productRepository.save(p);
            }
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            cancelled++;
        }

        // 2. CONFIRMED → SHIPPED if not shipped within threshold
        List<Order> staleConfirmed = orderRepository.findStaleConfirmedOrders(
                now.minusMinutes(confirmedShipMinutes));

        int autoShipped = 0;
        for (Order order : staleConfirmed) {
            order.setStatus(OrderStatus.SHIPPED);
            orderRepository.save(order);
            autoShipped++;
        }

        // 3. SHIPPED → DELIVERED if not delivered within threshold
        List<Order> staleShipped = orderRepository.findStaleOrders(
                OrderStatus.SHIPPED, now.minusMinutes(shippedDeliverMinutes));

        int delivered = 0;
        for (Order order : staleShipped) {
            order.setStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);
            delivered++;
        }

        return String.format(
                "Cancelled: %d | Auto-shipped: %d | Delivered: %d",
                cancelled, autoShipped, delivered);
    }
}