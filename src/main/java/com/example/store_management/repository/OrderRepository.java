package com.example.store_management.repository;

import com.example.store_management.model.Order;
import com.example.store_management.model.OrderStatus;
import com.example.store_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // All orders for a specific user, newest first (JPQL)
    @Query("SELECT o FROM Order o WHERE o.user = :user ORDER BY o.createdAt DESC")
    List<Order> findByUserOrderByCreatedAtDesc(@Param("user") User user);

    // All orders by status (for admin/scheduler use)
    @Query("SELECT o FROM Order o WHERE o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findByStatus(@Param("status") OrderStatus status);

    /**
     * Revenue counts only DELIVERED and SHIPPED orders.
     * PENDING and CONFIRMED are not yet fulfilled — counting them inflates revenue.
     */
    @Query(value = "SELECT COALESCE(SUM(total_price), 0) FROM orders " +
            "WHERE status IN ('SHIPPED', 'DELIVERED')",
            nativeQuery = true)
    double getTotalRevenue();

    // Count orders by status (native SQL)
    @Query(value = "SELECT COUNT(*) FROM orders WHERE status = :status",
            nativeQuery = true)
    int countByStatus(@Param("status") String status);

    // All orders stuck in a given status since before a cutoff time
    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.updatedAt < :cutoff")
    List<Order> findStaleOrders(@Param("status") OrderStatus status,
                                @Param("cutoff") java.time.LocalDateTime cutoff);

    // All orders confirmed but not yet shipped, older than a threshold
    @Query("SELECT o FROM Order o WHERE o.status = 'CONFIRMED' AND o.updatedAt < :cutoff")
    List<Order> findStaleConfirmedOrders(@Param("cutoff") java.time.LocalDateTime cutoff);

    @Query(value = "SELECT COUNT(*) FROM orders " +
            "WHERE created_at::date = CURRENT_DATE",
            nativeQuery = true)
    int countOrdersToday();

}