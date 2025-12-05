package com.mycompany.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:5173", "http://localhost:5174"})
@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/authenticated")
    public Map<String, Object> authenticatedEndpoint() {
        Map<String, Object> response = new HashMap<>();
        
        // Vérifier l'authentification
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            response.put("status", "success");
            response.put("message", "Authentifié");
            response.put("user", auth.getName());
            response.put("authorities", auth.getAuthorities().toString());
            response.put("timestamp", java.time.LocalDateTime.now().toString());
        } else {
            response.put("status", "error");
            response.put("message", "Non authentifié");
            response.put("timestamp", java.time.LocalDateTime.now().toString());
        }
        
        return response;
    }



    @GetMapping("/employee")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public Map<String, String> employeeEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Ceci est un endpoint employé");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return response;
    }

    @GetMapping("/hr")
    @PreAuthorize("hasRole('HR') or hasRole('HRMANAGER')")
    public Map<String, String> hrEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Ceci est un endpoint HR");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return response;
    }
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Backend Spring Boot is running on port 8081");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        response.put("corsEnabled", true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> publicEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "This is a public endpoint - CORS should work");
        response.put("accessible", true);
        response.put("timestamp", java.time.LocalDateTime.now().toString());

        // Log pour débogage
        System.out.println("✅ Public endpoint accessed successfully");

        return ResponseEntity.ok(response);
    }
}