package com.example.store_management.controller;

import com.example.store_management.config.JwtUtil;
import com.example.store_management.model.Role;
import com.example.store_management.model.User;
import com.example.store_management.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil               jwtUtil;

    // The one fixed admin username — everyone else becomes CUSTOMER
    private static final String ADMIN_USERNAME = "admin";

    public AuthController(UserRepository        userRepository,
                          PasswordEncoder       passwordEncoder,
                          AuthenticationManager authManager,
                          JwtUtil               jwtUtil) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager     = authManager;
        this.jwtUtil         = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email    = body.get("email");
        String password = body.get("password");

        if (username == null || email == null || password == null)
            return ResponseEntity.badRequest().body(Map.of("message", "All fields are required."));

        if (userRepository.existsByUsername(username))
            return ResponseEntity.badRequest().body(Map.of("message", "Username already taken."));

        if (userRepository.existsByEmail(email))
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered."));

        // The reserved username "admin" gets the ADMIN role; everyone else is CUSTOMER
        Role role = username.equalsIgnoreCase(ADMIN_USERNAME) ? Role.ADMIN : Role.CUSTOMER;

        User user = new User(username, email, passwordEncoder.encode(password), role);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return ResponseEntity.ok(Map.of(
                "token",    token,
                "username", user.getUsername(),
                "role",     user.getRole().name()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password required."));

        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password."));
        }

        User user  = userRepository.findByUsername(username).orElseThrow();
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return ResponseEntity.ok(Map.of(
                "token",    token,
                "username", user.getUsername(),
                "role",     user.getRole().name()
        ));
    }
}