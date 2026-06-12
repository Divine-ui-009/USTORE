package com.example.store_management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "scheduler_config")
public class SchedulerConfig {

    @Id
    private Long id = 1L; // singleton row — only one config exists

    /** How often the order lifecycle task runs, in minutes. */
    @Column(nullable = false)
    private int orderLifecycleIntervalMinutes = 1;

    /**
     * Minutes before a PENDING order is auto-cancelled if admin doesn't act.
     */
    @Column(nullable = false)
    private int pendingCancelAfterMinutes = 10;

    /**
     * Minutes before a CONFIRMED order is auto-shipped.
     */
    @Column(nullable = false)
    private int confirmedShipAfterMinutes = 20;

    /**
     * Minutes before a SHIPPED order is auto-delivered.
     */
    @Column(nullable = false)
    private int shippedDeliverAfterMinutes = 30;

    public SchedulerConfig() {}

    public Long getId()                                         { return id; }
    public void setId(Long id)                                  { this.id = id; }

    public int getOrderLifecycleIntervalMinutes()               { return orderLifecycleIntervalMinutes; }
    public void setOrderLifecycleIntervalMinutes(int v)         { this.orderLifecycleIntervalMinutes = v; }

    public int getPendingCancelAfterMinutes()                   { return pendingCancelAfterMinutes; }
    public void setPendingCancelAfterMinutes(int v)             { this.pendingCancelAfterMinutes = v; }

    public int getConfirmedShipAfterMinutes()                   { return confirmedShipAfterMinutes; }
    public void setConfirmedShipAfterMinutes(int v)             { this.confirmedShipAfterMinutes = v; }

    public int getShippedDeliverAfterMinutes()                  { return shippedDeliverAfterMinutes; }
    public void setShippedDeliverAfterMinutes(int v)            { this.shippedDeliverAfterMinutes = v; }
}