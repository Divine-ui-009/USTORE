package com.example.store_management.service;

import com.example.store_management.model.Category;
import com.example.store_management.model.Product;
import com.example.store_management.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // -------------------------------------------------------------------
    // BASIC CRUD
    // -------------------------------------------------------------------

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(updatedProduct.getName());
                    product.setDescription(updatedProduct.getDescription());
                    product.setImageUrl(updatedProduct.getImageUrl());
                    product.setPrice(updatedProduct.getPrice());
                    product.setQuantity(updatedProduct.getQuantity());
                    product.setIsAvailable(updatedProduct.getIsAvailable());
                    product.setCategory(updatedProduct.getCategory());  // was missing originally
                    return productRepository.save(product);
                })
                .orElse(null);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // -------------------------------------------------------------------
    // DERIVED QUERIES
    // -------------------------------------------------------------------

    public List<Product> getProductsByCategory(Category category) {
        return productRepository.findByCategory(category);
    }

    public List<Product> getAvailableProducts(boolean isAvailable) {
        return productRepository.findByIsAvailable(isAvailable);
    }

    public List<Product> getProductsByMaxPrice(double maxPrice) {
        return productRepository.findByPriceLessThanEqual(maxPrice);
    }

    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    // -------------------------------------------------------------------
    // JPQL NAMED PARAMETER QUERIES
    // -------------------------------------------------------------------

    public List<Product> getProductsByCategoryJpql(Category category) {
        return productRepository.findByCategoryJpql(category);
    }

    public List<Product> searchByKeyword(String keyword) {
        return productRepository.searchByKeyword(keyword);
    }

    public List<Product> getProductsByPriceRange(double min, double max) {
        return productRepository.findByPriceRange(min, max);
    }

    // -------------------------------------------------------------------
    // JPQL INDEXED PARAMETER QUERIES
    // -------------------------------------------------------------------

    public List<Product> getByAvailabilityIndexed(boolean available) {
        return productRepository.findByAvailabilityIndexed(available);
    }

    public List<Product> getByCategoryAndMinQuantity(Category category, int minQty) {
        return productRepository.findByCategoryAndMinQuantity(category, minQty);
    }

    // -------------------------------------------------------------------
    // JPQL SORTED QUERY
    // -------------------------------------------------------------------

    public List<Product> getAllProductsSortedByPrice(String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by("price").descending()
                : Sort.by("price").ascending();
        return productRepository.findAllSorted(sort);
    }

    public List<Product> getAllProductsSortedByName() {
        return productRepository.findAllSorted(Sort.by("name").ascending());
    }

    // -------------------------------------------------------------------
    // @Modifying JPQL UPDATES
    // -------------------------------------------------------------------

    public int updateAvailabilityByCategory(Category category, boolean available) {
        return productRepository.updateAvailabilityByCategory(category, available);
    }

    public int applyDiscount(Category category, double discountPercent) {
        // discountPercent is 0–100; convert to a fraction before passing
        return productRepository.applyDiscountToCategory(discountPercent / 100.0, category);
    }

    // -------------------------------------------------------------------
    // NATIVE SQL QUERIES
    // -------------------------------------------------------------------

    public List<Product> getAllProductsNative() {
        return productRepository.findAllNative();
    }

    public List<Product> getCheaperThanNative(double maxPrice) {
        return productRepository.findCheaperThanNative(maxPrice);
    }

    public List<Product> searchByNameNative(String keyword) {
        return productRepository.searchByNameNative(keyword);
    }

    public List<Product> getAvailableProductsNative() {
        return productRepository.findAvailableNative();
    }

    public int clearStockByCategory(String category) {
        return productRepository.clearStockByCategory(category);
    }
}