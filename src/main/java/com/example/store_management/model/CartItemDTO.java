package com.example.store_management.model;

public class CartItemDTO {

    private Long   id;
    private Long   productId;
    private String productName;
    private String productImageUrl;
    private String category;
    private double price;
    private int    quantity;
    private int    stockAvailable;
    private double lineTotal;

    public CartItemDTO(CartItem item) {
        this.id              = item.getId();
        this.productId       = item.getProduct().getId();
        this.productName     = item.getProduct().getName();
        this.productImageUrl = item.getProduct().getImageUrl();
        this.category        = item.getProduct().getCategory() != null
                ? item.getProduct().getCategory().name() : null;
        this.price           = item.getProduct().getPrice();
        this.quantity        = item.getQuantity();
        this.stockAvailable  = item.getProduct().getQuantity();
        this.lineTotal       = item.getProduct().getPrice() * item.getQuantity();
    }

    public Long   getId()               { return id; }
    public Long   getProductId()        { return productId; }
    public String getProductName()      { return productName; }
    public String getProductImageUrl()  { return productImageUrl; }
    public String getCategory()         { return category; }
    public double getPrice()            { return price; }
    public int    getQuantity()         { return quantity; }
    public int    getStockAvailable()   { return stockAvailable; }
    public double getLineTotal()        { return lineTotal; }
}