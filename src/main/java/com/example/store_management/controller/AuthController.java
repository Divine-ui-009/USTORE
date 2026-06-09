package com.example.store_management.controller;

import com.example.store_management.model.User;
import com.example.store_management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> body){
        String username = body.getOrDefault("username", "guest");
        return ResponseEntity.ok(Map.of(
                "token", "stub-jwt-token-replace-me",
                "username", username,
                "role", "USER"
        ));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.registerUser(user));
    }


}
