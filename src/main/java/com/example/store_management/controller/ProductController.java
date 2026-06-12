package com.example.store_management.controller;

import com.example.store_management.model.Category;
import com.example.store_management.model.Product;
import com.example.store_management.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.addProduct(product));
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                 @RequestBody Product product) {
        Product updated = productService.updateProduct(id, product);
        return updated != null
                ? ResponseEntity.ok(updated)
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }


    // GET /api/products/category/MEN
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getByCategory(@PathVariable Category category) {
        return ResponseEntity.ok(productService.getProductsByCategoryJpql(category));
    }

    // GET /api/products/available?status=true
    @GetMapping("/available")
    public ResponseEntity<List<Product>> getByAvailability(
            @RequestParam(defaultValue = "true") boolean status) {
        return ResponseEntity.ok(productService.getAvailableProducts(status));
    }

    // GET /api/products/search?keyword=shirt
    @GetMapping("/search")
    public ResponseEntity<List<Product>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchByKeyword(keyword));
    }

    // GET /api/products/search/native?keyword=shirt
    @GetMapping("/search/native")
    public ResponseEntity<List<Product>> searchNative(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchByNameNative(keyword));
    }

    // GET /api/products/price-range?min=10&max=100
    @GetMapping("/price-range")
    public ResponseEntity<List<Product>> getByPriceRange(@RequestParam double min,
                                                         @RequestParam double max) {
        return ResponseEntity.ok(productService.getProductsByPriceRange(min, max));
    }

    // GET /api/products/cheaper-than?max=50
    @GetMapping("/cheaper-than")
    public ResponseEntity<List<Product>> cheaperThan(@RequestParam double max) {
        return ResponseEntity.ok(productService.getCheaperThanNative(max));
    }

    // GET /api/products/sorted?by=price&dir=asc
    @GetMapping("/sorted")
    public ResponseEntity<List<Product>> getSorted(
            @RequestParam(defaultValue = "price") String by,
            @RequestParam(defaultValue = "asc") String dir) {
        if (by.equalsIgnoreCase("name")) {
            return ResponseEntity.ok(productService.getAllProductsSortedByName());
        }
        return ResponseEntity.ok(productService.getAllProductsSortedByPrice(dir));
    }

    // GET /api/products/available/native
    @GetMapping("/available/native")
    public ResponseEntity<List<Product>> getAvailableNative() {
        return ResponseEntity.ok(productService.getAvailableProductsNative());
    }

    // GET /api/products/category/{category}/min-quantity?qty=5
    @GetMapping("/category/{category}/min-quantity")
    public ResponseEntity<List<Product>> getByCategoryAndQty(
            @PathVariable Category category,
            @RequestParam(defaultValue = "1") int qty) {
        return ResponseEntity.ok(productService.getByCategoryAndMinQuantity(category, qty));
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<Product>> getProductsPaged(
            @RequestParam(defaultValue = "0")     int page,
            @RequestParam(defaultValue = "8")     int size,
            @RequestParam(defaultValue = "id")    String sortBy,
            @RequestParam(defaultValue = "desc")  String dir,
            @RequestParam(required = false)       String category) {

        Sort sort = dir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        // If a category filter is provided, use the category-specific query
        if (category != null && !category.isBlank()) {
            try {
                Category cat = Category.valueOf(category.toUpperCase());
                return ResponseEntity.ok(productService.getProductsPagedByCategory(cat, pageable));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        return ResponseEntity.ok(productService.getProductsPaged(pageable));
    }



    // PUT /api/products/category/MEN/availability?available=false
    @PutMapping("/category/{category}/availability")
    public ResponseEntity<Integer> updateCategoryAvailability(
            @PathVariable Category category,
            @RequestParam boolean available) {
        int count = productService.updateAvailabilityByCategory(category, available);
        return ResponseEntity.ok(count);
    }

    // PUT /api/products/category/MEN/discount?percent=10
    @PutMapping("/category/{category}/discount")
    public ResponseEntity<Integer> applyDiscount(
            @PathVariable Category category,
            @RequestParam double percent) {
        int count = productService.applyDiscount(category, percent);
        return ResponseEntity.ok(count);
    }

    // PUT /api/products/category/MEN/clear-stock
    @PutMapping("/category/{category}/clear-stock")
    public ResponseEntity<Integer> clearStock(@PathVariable String category) {
        int count = productService.clearStockByCategory(category.toUpperCase());
        return ResponseEntity.ok(count);
    }
}