package com.example.store_management;

import com.example.store_management.model.Category;
import com.example.store_management.model.Product;
import com.example.store_management.repository.ProductRepository;
import com.example.store_management.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = new Product(
                1L, "Test Shirt", "A nice shirt",
                null, Category.MEN, 29.99, 10, true
        );
    }

    // ── addProduct ──────────────────────────────────────────────────────────

    @Test
    void addProduct_shouldSaveAndReturnProduct() {
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        Product result = productService.addProduct(sampleProduct);

        assertNotNull(result);
        assertEquals("Test Shirt", result.getName());
        verify(productRepository, times(1)).save(sampleProduct);
    }

    // ── getAllProducts ───────────────────────────────────────────────────────

    @Test
    void getAllProducts_shouldReturnAllProducts() {
        Product second = new Product(2L, "Jeans", "Blue jeans",
                null, Category.WOMEN, 49.99, 5, true);
        when(productRepository.findAll()).thenReturn(List.of(sampleProduct, second));

        List<Product> result = productService.getAllProducts();

        assertEquals(2, result.size());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void getAllProducts_whenEmpty_shouldReturnEmptyList() {
        when(productRepository.findAll()).thenReturn(List.of());

        List<Product> result = productService.getAllProducts();

        assertTrue(result.isEmpty());
    }

    // ── getProductById ───────────────────────────────────────────────────────

    @Test
    void getProductById_whenFound_shouldReturnProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        Optional<Product> result = productService.getProductById(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
    }

    @Test
    void getProductById_whenNotFound_shouldReturnEmpty() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Product> result = productService.getProductById(99L);

        assertFalse(result.isPresent());
    }

    // ── updateProduct ────────────────────────────────────────────────────────

    @Test
    void updateProduct_whenExists_shouldUpdateFields() {
        Product updated = new Product(
                1L, "Updated Shirt", "Even nicer",
                null, Category.MEN, 39.99, 20, false
        );
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(updated);

        Product result = productService.updateProduct(1L, updated);

        assertNotNull(result);
        assertEquals("Updated Shirt", result.getName());
        assertEquals(39.99, result.getPrice());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProduct_whenNotFound_shouldReturnNull() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        Product result = productService.updateProduct(99L, sampleProduct);

        assertNull(result);
        verify(productRepository, never()).save(any());
    }

    // ── deleteProduct ────────────────────────────────────────────────────────

    @Test
    void deleteProduct_shouldCallDeleteById() {
        doNothing().when(productRepository).deleteById(1L);

        productService.deleteProduct(1L);

        verify(productRepository, times(1)).deleteById(1L);
    }

    // ── searchByKeyword ──────────────────────────────────────────────────────

    @Test
    void searchByKeyword_shouldReturnMatchingProducts() {
        when(productRepository.searchByKeyword("shirt"))
                .thenReturn(List.of(sampleProduct));

        List<Product> result = productService.searchByKeyword("shirt");

        assertEquals(1, result.size());
        assertEquals("Test Shirt", result.get(0).getName());
    }

    // ── getProductsByPriceRange ──────────────────────────────────────────────

    @Test
    void getProductsByPriceRange_shouldReturnProductsInRange() {
        when(productRepository.findByPriceRange(10.0, 50.0))
                .thenReturn(List.of(sampleProduct));

        List<Product> result = productService.getProductsByPriceRange(10.0, 50.0);

        assertEquals(1, result.size());
        assertTrue(result.get(0).getPrice() >= 10.0);
        assertTrue(result.get(0).getPrice() <= 50.0);
    }
}