package com.mycompany.backend.controllers;

import com.mycompany.backend.dto.*;

import com.mycompany.backend.services.LinkedInIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/linkedin")
@PreAuthorize("hasRole('HR') or hasRole('HRMANAGER') or hasRole('ADMIN')")
public class LinkedInIntegrationController {

    @Autowired
    private LinkedInIntegrationService linkedInService;

    // 🔗 INITIER L'AUTHENTIFICATION
    @PostMapping("/auth/initiate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LinkedInAuthResponse> initiateAuth(@RequestBody LinkedInAuthRequest request) {
        LinkedInAuthResponse response = linkedInService.initiateAuth(request.getOrganizationId());
        return ResponseEntity.ok(response);
    }

    // 🔄 CALLBACK OAuth
    @GetMapping("/auth/callback")
    public ResponseEntity<?> handleCallback(
            @RequestParam String code,
            @RequestParam String state) {
        try {
            LinkedInTokenResponse response = linkedInService.handleCallback(code, state);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "authentication_failed",
                    "message", e.getMessage()
            ));
        }
    }

    // 🚀 PUBLIER UNE OFFRE
    @PostMapping("/job-offers/{id}/publish")
    public ResponseEntity<LinkedInPostResponse> publishJobOffer(@PathVariable String id) {
        LinkedInPostResponse response = linkedInService.publishJobOffer(id);
        return ResponseEntity.ok(response);
    }

    // 📊 STATISTIQUES
    @GetMapping("/posts/{postId}/stats")
    public ResponseEntity<?> getPostStats(@PathVariable String postId) {
        try {
            Map<String, Object> stats = linkedInService.getPostStatistics(postId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "failed_to_get_stats",
                    "message", e.getMessage()
            ));
        }
    }

    // 🔍 ÉTAT DE L'INTÉGRATION
    @GetMapping("/integration/status")
    public ResponseEntity<?> getIntegrationStatus() {
        try {
            LinkedInIntegrationStatus status = linkedInService.getIntegrationStatus("current");
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "connected", false,
                    "message", "Not connected to LinkedIn"
            ));
        }
    }

    // 📋 OFFRES PUBLIÉES
    @GetMapping("/published-posts")
    public ResponseEntity<?> getPublishedPosts() {
        try {
            return ResponseEntity.ok(linkedInService.getPublishedPosts("current"));
        } catch (Exception e) {
            return ResponseEntity.ok( List.of());
        }
    }
}