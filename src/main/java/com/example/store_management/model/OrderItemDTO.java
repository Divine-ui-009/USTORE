package com.example.store_management.model;

public class OrderItemDTO {

    private Long   id;
    private String productName;
    private String productImageUrl;
    private String category;
    private int    quantity;
    private double priceAtPurchase;
    private double lineTotal;

    public OrderItemDTO(OrderItem item) {
        this.id              = item.getId();
        this.productName     = item.getProduct().getName();
        this.productImageUrl = item.getProduct().getImageUrl();
        this.category        = item.getProduct().getCategory() != null
                ? item.getProduct().getCategory().name() : null;
        this.quantity        = item.getQuantity();
        this.priceAtPurchase = item.getPriceAtPurchase();
        this.lineTotal       = item.getPriceAtPurchase() * item.getQuantity();
    }

    public Long   getId()                { return id; }
    public String getProductName()       { return productName; }
    public String getProductImageUrl()   { return productImageUrl; }
    public String getCategory()          { return category; }
    public int    getQuantity()          { return quantity; }
    public double getPriceAtPurchase()   { return priceAtPurchase; }
    public double getLineTotal()         { return lineTotal; }
}