package com.example.store_management.controller;

import com.example.store_management.model.CartItem;
import com.example.store_management.model.CartItemDTO;
import com.example.store_management.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart(Principal principal) {
        List<CartItemDTO> dtos = cartService.getCart(principal.getName())
                .stream().map(CartItemDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCount(Principal principal) {
        return ResponseEntity.ok(cartService.getCartCount(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<?> addToCart(Principal principal,
                                       @RequestBody Map<String, Integer> body) {
        try {
            Long productId = Long.valueOf(body.get("productId"));
            int  quantity  = body.getOrDefault("quantity", 1);
            CartItem item  = cartService.addToCart(
                    principal.getName(), productId, quantity);
            return ResponseEntity.ok(new CartItemDTO(item));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<?> updateQuantity(Principal principal,
                                            @PathVariable Long cartItemId,
                                            @RequestBody Map<String, Integer> body) {
        try {
            CartItem item = cartService.updateQuantity(
                    principal.getName(), cartItemId,
                    body.getOrDefault("quantity", 1));
            return item != null
                    ? ResponseEntity.ok(new CartItemDTO(item))
                    : ResponseEntity.ok(Map.of("message", "Item removed."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeItem(Principal principal,
                                        @PathVariable Long cartItemId) {
        try {
            cartService.removeFromCart(principal.getName(), cartItemId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(Principal principal) {
        cartService.clearCart(principal.getName());
        return ResponseEntity.noContent().build();
    }
}