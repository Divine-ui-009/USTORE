package com.example.store_management.service;

import com.example.store_management.model.*;
import com.example.store_management.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository  productRepository;
    private final UserRepository     userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository  productRepository,
                       UserRepository     userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository  = productRepository;
        this.userRepository     = userRepository;
    }

    // Get all items in a user's cart
    public List<CartItem> getCart(String username) {
        User user = getUser(username);
        return cartItemRepository.findByUser(user);
    }

    // Add a product to cart, or increment quantity if already present
    @Transactional
    public CartItem addToCart(String username, Long productId, int quantity) {
        User    user    = getUser(username);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        if (!product.getIsAvailable())
            throw new RuntimeException("Product is not available.");

        if (product.getQuantity() < quantity)
            throw new RuntimeException("Only " + product.getQuantity() + " items left in stock.");

        Optional<CartItem> existing =
                cartItemRepository.findByUserAndProductId(user, productId);

        if (existing.isPresent()) {
            CartItem item    = existing.get();
            int      newQty  = item.getQuantity() + quantity;
            if (newQty > product.getQuantity())
                throw new RuntimeException("Only " + product.getQuantity() + " items in stock.");
            item.setQuantity(newQty);
            return cartItemRepository.save(item);
        }

        return cartItemRepository.save(new CartItem(user, product, quantity));
    }

    // Update quantity of a specific cart item
    @Transactional
    public CartItem updateQuantity(String username, Long cartItemId, int quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found."));

        if (!item.getUser().getUsername().equals(username))
            throw new RuntimeException("Not your cart item.");

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        }

        if (quantity > item.getProduct().getQuantity())
            throw new RuntimeException("Only " + item.getProduct().getQuantity() + " in stock.");

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    // Remove one item from cart
    @Transactional
    public void removeFromCart(String username, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found."));

        if (!item.getUser().getUsername().equals(username))
            throw new RuntimeException("Not your cart item.");

        cartItemRepository.delete(item);
    }

    // Clear the entire cart
    @Transactional
    public void clearCart(String username) {
        User user = getUser(username);
        cartItemRepository.clearCartByUserId(user.getId());
    }

    // Count items in cart (for the badge)
    public int getCartCount(String username) {
        User user = getUser(username);
        return cartItemRepository.countByUser(user);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}