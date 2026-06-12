package com.example.store_management.service;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ActiveUserRegistry {
    private final Set<String> activeUsers =
            Collections.newSetFromMap(new ConcurrentHashMap<>());

    public void userLoggedIn(String username){
        activeUsers.add(username);
    }

    public void userLoggedOut(String username){
        activeUsers.remove(username);
    }

    public Set<String> getActiveUsers(){
        return Collections.unmodifiableSet(activeUsers);
    }

    public boolean isAnyoneLoggedIn(){
        return !activeUsers.isEmpty();
    }
}
