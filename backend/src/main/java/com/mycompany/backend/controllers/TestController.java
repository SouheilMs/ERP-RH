package com.mycompany.backend.controllers;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/public")
    public String publicEndpoint() {
        return "Ceci est un endpoint public";
    }

    @GetMapping("/authenticated")
    public String authenticatedEndpoint() {
        return "Ceci est un endpoint authentifié";
    }

    @GetMapping("/hr")
    @PreAuthorize("hasRole('HR') or hasRole('HRMANAGER')")
    public String hrEndpoint() {
        return "Ceci est un endpoint HR";
    }
}