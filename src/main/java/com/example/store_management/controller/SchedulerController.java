package com.example.store_management.controller;

import com.example.store_management.model.SchedulerConfig;
import com.example.store_management.service.DynamicSchedulerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scheduler")
public class SchedulerController {

    private final DynamicSchedulerService schedulerService;

    public SchedulerController(DynamicSchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    // GET /api/scheduler/config
    @GetMapping("/config")
    public ResponseEntity<SchedulerConfig> getConfig() {
        return ResponseEntity.ok(schedulerService.getConfig());
    }

    /**
     * PUT /api/scheduler/config
     * Body: {
     *   "orderLifecycleIntervalMinutes": 2,
     *   "pendingCancelAfterMinutes": 15,
     *   "confirmedShipAfterMinutes": 30,
     *   "shippedDeliverAfterMinutes": 60
     * }
     * This instantly reschedules the task with the new interval.
     */
    @PutMapping("/config")
    public ResponseEntity<SchedulerConfig> updateConfig(
            @RequestBody SchedulerConfig config) {
        return ResponseEntity.ok(schedulerService.updateConfig(config));
    }
}