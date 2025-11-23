package com.mycompany.backend.controllers;

import com.mycompany.backend.entities.Conge;
import com.mycompany.backend.payload.request.CongeRequestDTO;
import com.mycompany.backend.payload.response.CongeStatusUpdateDTO;
import com.mycompany.backend.services.CongeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/conges")
@CrossOrigin(origins = "*")
public class CongeController {

    @Autowired
    private CongeService congeService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Conge>> getEmployeeConges(@PathVariable String employeeId) {
        List<Conge> conges = congeService.getEmployeeConges(employeeId);
        return ResponseEntity.ok(conges);
    }

    @GetMapping("/{congeId}")
    public ResponseEntity<?> getCongeById(@PathVariable String id) {
        Optional<Conge> conge = congeService.getCongeById(id);
        if (conge.isPresent()) {
            return ResponseEntity.ok(conge.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Conge not found");
        }
    }

    @PostMapping("/submit/{employeeId}")
    public ResponseEntity<?> submitCongeRequest(
            @PathVariable String employeeId,
            @RequestBody CongeRequestDTO requestDTO) {
        try {
            Conge conge = congeService.submitCongeRequest(employeeId, requestDTO);
            return ResponseEntity.ok(conge);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{congeId}/status")
    public ResponseEntity<?> updateCongeStatus(
            @PathVariable String congeId,
            @RequestParam String managerId,
            @RequestBody CongeStatusUpdateDTO statusDTO) {
        try {
            Conge updatedConge = congeService.updateCongeStatus(congeId, managerId, statusDTO);
            return ResponseEntity.ok(updatedConge);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{congeId}/employee/{employeeId}")
    public ResponseEntity<?> deleteConge(
            @PathVariable String congeId,
            @PathVariable String employeeId) {
        try {
            congeService.deleteConge(congeId, employeeId);
            return ResponseEntity.ok("Conge request deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}