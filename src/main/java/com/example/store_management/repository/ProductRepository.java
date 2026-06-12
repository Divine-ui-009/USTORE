package com.example.store_management.repository;

import com.example.store_management.model.Category;
import com.example.store_management.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(Category category);

    List<Product> findByIsAvailable(boolean isAvailable);

    List<Product> findByPriceLessThanEqual(double maxPrice);

    List<Product> findByNameContainingIgnoreCase(String keyword);


    @Query("SELECT p FROM Product p WHERE p.category = :category")
    List<Product> findByCategoryJpql(@Param("category") Category category);

    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceRange(@Param("minPrice") double minPrice,
                                   @Param("maxPrice") double maxPrice);



    @Query("SELECT p FROM Product p WHERE p.isAvailable = ?1")
    List<Product> findByAvailabilityIndexed(boolean isAvailable);

    @Query("SELECT p FROM Product p WHERE p.category = ?1 AND p.quantity >= ?2")
    List<Product> findByCategoryAndMinQuantity(Category category, int minQuantity);


    @Query("SELECT p FROM Product p")
    List<Product> findAllSorted(Sort sort);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.isAvailable = :available WHERE p.category = :category")
    int updateAvailabilityByCategory(@Param("category") Category category,
                                     @Param("available") boolean available);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.price = p.price * (1 - :discount) WHERE p.category = :category")
    int applyDiscountToCategory(@Param("discount") double discount,
                                @Param("category") Category category);

    // Paginated by category
    @Query("SELECT p FROM Product p WHERE p.category = :category")
    Page<Product> findByCategory(@Param("category") Category category, Pageable pageable);

    // Count by category (needed for total pages)
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category = :category")
    long countByCategory(@Param("category") Category category);

    @Query(value = "SELECT * FROM products", nativeQuery = true)
    List<Product> findAllNative();

    @Query(value = "SELECT * FROM products WHERE price <= ?1", nativeQuery = true)
    List<Product> findCheaperThanNative(double maxPrice);

    @Query(value = "SELECT * FROM products WHERE name LIKE %:keyword%", nativeQuery = true)
    List<Product> searchByNameNative(@Param("keyword") String keyword);

    @Query(value = "SELECT * FROM products WHERE is_available = true", nativeQuery = true)
    List<Product> findAvailableNative();

    @Modifying
    @Transactional
    @Query(value = "UPDATE products SET quantity = 0 WHERE category = :category",
            nativeQuery = true)
    int clearStockByCategory(@Param("category") String category);
}