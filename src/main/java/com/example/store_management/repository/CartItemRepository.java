package com.example.store_management.repository;

import com.example.store_management.model.CartItem;
import com.example.store_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // All cart items for a user (JPQL named param)
    @Query("SELECT c FROM CartItem c WHERE c.user = :user")
    List<CartItem> findByUser(@Param("user") User user);

    // Find a specific product already in a user's cart
    @Query("SELECT c FROM CartItem c WHERE c.user = :user AND c.product.id = :productId")
    Optional<CartItem> findByUserAndProductId(@Param("user") User user,
                                              @Param("productId") Long productId);

    // Clear entire cart for a user after checkout (native SQL)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM cart_items WHERE user_id = :userId", nativeQuery = true)
    void clearCartByUserId(@Param("userId") Long userId);

    // Count how many distinct items are in a user's cart
    @Query("SELECT COUNT(c) FROM CartItem c WHERE c.user = :user")
    int countByUser(@Param("user") User user);
}