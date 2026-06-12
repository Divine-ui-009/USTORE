package com.example.store_management.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderDTO {

    private Long              id;
    private String            username;
    private String            status;
    private LocalDateTime     createdAt;
    private LocalDateTime     updatedAt;
    private double            totalPrice;
    private List<OrderItemDTO> items;

    public OrderDTO(Order order) {
        this.id         = order.getId();
        this.username   = order.getUser().getUsername();
        this.status     = order.getStatus().name();
        this.createdAt  = order.getCreatedAt();
        this.updatedAt  = order.getUpdatedAt();
        this.totalPrice = order.getTotalPrice();
        this.items      = order.getItems().stream()
                .map(OrderItemDTO::new)
                .collect(Collectors.toList());
    }

    public Long               getId()         { return id; }
    public String             getUsername()   { return username; }
    public String             getStatus()     { return status; }
    public LocalDateTime      getCreatedAt()  { return createdAt; }
    public LocalDateTime      getUpdatedAt()  { return updatedAt; }
    public double             getTotalPrice() { return totalPrice; }
    public List<OrderItemDTO> getItems()      { return items; }
}