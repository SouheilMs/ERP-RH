package com.mycompany.backend.controllers;

import com.mycompany.backend.dto.JobOfferDTO;
import com.mycompany.backend.dto.JobOfferRequest;
import com.mycompany.backend.entities.JobOffer;
import com.mycompany.backend.services.JobOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-offers")
public class JobOfferController {

    @Autowired
    private JobOfferService jobOfferService;

    @PostMapping
    public ResponseEntity<JobOfferDTO> create(@RequestBody JobOfferRequest request,
                                              @RequestParam String publisherId) {
        JobOfferDTO created = jobOfferService.create(request, publisherId);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOfferDTO> getById(@PathVariable String id) {
        return jobOfferService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<JobOfferDTO>> getAll() {
        List<JobOfferDTO> jobOffers = jobOfferService.getAll();
        return ResponseEntity.ok(jobOffers);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOfferDTO> update(@PathVariable String id,
                                              @RequestBody JobOfferRequest request) {
        try {
            JobOfferDTO updated = jobOfferService.update(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            jobOfferService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<JobOfferDTO> publish(@PathVariable String id) {
        try {
            JobOfferDTO published = jobOfferService.publish(id);
            return ResponseEntity.ok(published);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<JobOfferDTO> close(@PathVariable String id) {
        try {
            JobOfferDTO closed = jobOfferService.close(id);
            return ResponseEntity.ok(closed);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobOfferDTO>> search(@RequestParam String keyword) {
        List<JobOfferDTO> results = jobOfferService.search(keyword);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<JobOfferDTO>> getByStatus(@PathVariable JobOffer.JobOfferStatus status) {
        List<JobOfferDTO> jobOffers = jobOfferService.getByStatus(status);
        return ResponseEntity.ok(jobOffers);
    }

    @GetMapping("/active")
    public ResponseEntity<List<JobOfferDTO>> getActive() {
        List<JobOfferDTO> jobOffers = jobOfferService.getActive();
        return ResponseEntity.ok(jobOffers);
    }
}