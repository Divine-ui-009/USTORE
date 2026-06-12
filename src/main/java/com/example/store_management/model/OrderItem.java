package com.example.store_management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private double priceAtPurchase;

    public OrderItem() {}

    public OrderItem(Order order, Product product, int quantity) {
        this.order           = order;
        this.product         = product;
        this.quantity        = quantity;
        this.priceAtPurchase = product.getPrice();
    }

    public Long getId()                        { return id; }
    public void setId(Long id)                 { this.id = id; }

    public Order getOrder()                    { return order; }
    public void setOrder(Order order)          { this.order = order; }

    public Product getProduct()                { return product; }
    public void setProduct(Product product)    { this.product = product; }

    public int getQuantity()                   { return quantity; }
    public void setQuantity(int quantity)      { this.quantity = quantity; }

    public double getPriceAtPurchase()                   { return priceAtPurchase; }
    public void setPriceAtPurchase(double priceAtPurchase){ this.priceAtPurchase = priceAtPurchase; }
}