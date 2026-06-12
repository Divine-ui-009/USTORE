package com.example.store_management.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Tracks when the status last changed — used by the scheduler
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(nullable = false)
    private double totalPrice;

    public Order() {}

    public Order(User user, double totalPrice) {
        this.user       = user;
        this.totalPrice = totalPrice;
    }

    public Long getId()                              { return id; }
    public void setId(Long id)                       { this.id = id; }

    public User getUser()                            { return user; }
    public void setUser(User user)                   { this.user = user; }

    public List<OrderItem> getItems()                { return items; }
    public void setItems(List<OrderItem> items)      { this.items = items; }

    public OrderStatus getStatus()                   { return status; }
    public void setStatus(OrderStatus status)        {
        this.status    = status;
        this.updatedAt = LocalDateTime.now();  // auto-stamp on every change
    }

    public LocalDateTime getCreatedAt()              { return createdAt; }
    public void setCreatedAt(LocalDateTime t)        { this.createdAt = t; }

    public LocalDateTime getUpdatedAt()              { return updatedAt; }
    public void setUpdatedAt(LocalDateTime t)        { this.updatedAt = t; }

    public double getTotalPrice()                    { return totalPrice; }
    public void setTotalPrice(double totalPrice)     { this.totalPrice = totalPrice; }
}