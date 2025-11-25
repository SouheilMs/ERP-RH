package com.mycompany.backend.controllers;

import com.mycompany.backend.dto.FormationRequestDTO;
import com.mycompany.backend.dto.FormationResponseDTO;
import com.mycompany.backend.entities.Formation;
import com.mycompany.backend.services.FormationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationController {

    private final FormationService formationService;

    @PostMapping
    public ResponseEntity<FormationResponseDTO> createFormation(
            @RequestBody FormationRequestDTO request,
            @RequestParam String createdById) {
        FormationResponseDTO created = formationService.createFormation(request, createdById);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormationResponseDTO> getFormationById(@PathVariable String id) {
        FormationResponseDTO formation = formationService.getFormationById(id);
        return ResponseEntity.ok(formation);
    }

    @GetMapping
    public ResponseEntity<List<FormationResponseDTO>> getAllFormations() {
        List<FormationResponseDTO> formations = formationService.getAllFormations();
        return ResponseEntity.ok(formations);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormationResponseDTO> updateFormation(
            @PathVariable String id,
            @RequestBody FormationRequestDTO request) {
        FormationResponseDTO updated = formationService.updateFormation(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormation(@PathVariable String id) {
        formationService.deleteFormation(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<FormationResponseDTO> startFormation(@PathVariable String id) {
        FormationResponseDTO updated = formationService.startFormation(id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<FormationResponseDTO> completeFormation(@PathVariable String id) {
        FormationResponseDTO updated = formationService.completeFormation(id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<FormationResponseDTO> cancelFormation(@PathVariable String id) {
        FormationResponseDTO updated = formationService.cancelFormation(id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/participants/{employeeId}")
    public ResponseEntity<FormationResponseDTO> addParticipant(
            @PathVariable String id,
            @PathVariable String employeeId) {
        FormationResponseDTO updated = formationService.addParticipant(id, employeeId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/participants/{employeeId}")
    public ResponseEntity<FormationResponseDTO> removeParticipant(
            @PathVariable String id,
            @PathVariable String employeeId) {
        FormationResponseDTO updated = formationService.removeParticipant(id, employeeId);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/participant/{employeeId}")
    public ResponseEntity<List<FormationResponseDTO>> getFormationsByParticipant(
            @PathVariable String employeeId) {
        List<FormationResponseDTO> formations = formationService.getFormationsByParticipant(employeeId);
        return ResponseEntity.ok(formations);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<FormationResponseDTO>> getFormationsByStatus(
            @PathVariable Formation.FormationStatus status) {
        List<FormationResponseDTO> formations = formationService.getFormationsByStatus(status);
        return ResponseEntity.ok(formations);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<FormationResponseDTO>> getFormationsByCategory(
            @PathVariable String category) {
        List<FormationResponseDTO> formations = formationService.getFormationsByCategory(category);
        return ResponseEntity.ok(formations);
    }

    @GetMapping("/search")
    public ResponseEntity<List<FormationResponseDTO>> searchFormations(
            @RequestParam String keyword) {
        List<FormationResponseDTO> formations = formationService.searchFormations(keyword);
        return ResponseEntity.ok(formations);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<FormationResponseDTO>> getUpcomingFormations() {
        List<FormationResponseDTO> formations = formationService.getUpcomingFormations();
        return ResponseEntity.ok(formations);
    }

    @GetMapping("/stats/count")
    public ResponseEntity<Long> getFormationCount() {
        long count = formationService.getFormationCount();
        return ResponseEntity.ok(count);
    }
}