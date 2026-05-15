package com.example.store_management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private double price;

    @Column(nullable = true)
    private String imageUrl;

    private int quantity;
    @Column(nullable = true)
    private boolean isAvailable;

    @Enumerated(EnumType.STRING)
    private Category category;

    public Product() {}

    public Product(Long id, String name, String description, String imageUrl, Category category,
                   double price, int quantity, boolean isAvailable ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.quantity = quantity;
        this.isAvailable = isAvailable;

        if(imageUrl == null || imageUrl.isBlank()){
            this.imageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHICWZcFeQ7UuaU7N30-E4Vt1GaTYIU1DIEA&s";
        } else {
            this.imageUrl = imageUrl;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() {
        return imageUrl;
    }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(boolean available) { isAvailable = available; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
}