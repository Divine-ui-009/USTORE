package com.example.store_management.repository;

import com.example.store_management.model.SchedulerConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchedulerConfigRepository extends JpaRepository<SchedulerConfig, Long> {
}