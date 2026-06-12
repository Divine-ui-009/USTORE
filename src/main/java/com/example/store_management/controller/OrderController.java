package com.example.store_management.controller;

import com.example.store_management.model.Order;
import com.example.store_management.model.OrderDTO;
import com.example.store_management.model.OrderStatus;
import com.example.store_management.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Customer: place order from cart
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(Principal principal) {
        try {
            Order order = orderService.checkout(principal.getName());
            return ResponseEntity.ok(new OrderDTO(order));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Customer: their own orders
    @GetMapping("/my")
    public ResponseEntity<List<OrderDTO>> getMyOrders(Principal principal) {
        List<OrderDTO> dtos = orderService.getUserOrders(principal.getName())
                .stream().map(OrderDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Admin: all orders
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> dtos = orderService.getAllOrders()
                .stream().map(OrderDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Admin: update order status
    // PUT /api/orders/{id}/status   body: { "status": "CONFIRMED" }
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody Map<String, String> body) {
        try {
            OrderStatus status = OrderStatus.valueOf(
                    body.get("status").toUpperCase());
            Order order = orderService.updateStatus(id, status);
            return ResponseEntity.ok(new OrderDTO(order));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Admin: revenue summary
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Double>> getRevenue() {
        return ResponseEntity.ok(
                Map.of("totalRevenue", orderService.getTotalRevenue()));
    }

    // Admin: orders by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderDTO>> getByStatus(
            @PathVariable String status) {
        try {
            OrderStatus s = OrderStatus.valueOf(status.toUpperCase());
            List<OrderDTO> dtos = orderService.getOrdersByStatus(s)
                    .stream().map(OrderDTO::new).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}