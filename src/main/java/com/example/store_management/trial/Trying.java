package com.example.store_management.trial;


import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class Trying {
    @Scheduled(cron = "0 * * * * *")
    public void logging() {
        System.out.println("Not logged in...");
    }
}
