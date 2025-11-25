package com.mycompany.backend.dto;

import com.mycompany.backend.entities.Formation;
import com.mycompany.backend.entities.Employee; // AJOUT IMPORT
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class FormationResponseDTO {
    private String id;
    private String title;
    private String description;
    private String location;
    private String formateur;
    private Integer maxParticipants;
    private LocalDate startDate;
    private LocalDate endDate;
    private String startTime;
    private String endTime;
    private String certificateId;
    private Formation.FormationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private Set<String> participants;
    private Double cost;
    private String category;
    private String skills;
    private Integer currentParticipants;

    public FormationResponseDTO(Formation formation) {
        this.id = formation.getId();
        this.title = formation.getTitle();
        this.description = formation.getDescription();
        this.location = formation.getLocation();
        this.formateur = formation.getFormateur();
        this.maxParticipants = formation.getMaxParticipants();
        this.startDate = formation.getStartDate();
        this.endDate = formation.getEndDate();
        this.startTime = formation.getStartTime();
        this.endTime = formation.getEndTime();
        this.certificateId = formation.getCertificateId();
        this.status = formation.getStatus();
        this.createdAt = formation.getCreatedAt();
        this.updatedAt = formation.getUpdatedAt();
        this.cost = formation.getCost();
        this.category = formation.getCategory();
        this.skills = formation.getSkills();
        this.currentParticipants = formation.getParticipants() != null ? formation.getParticipants().size() : 0;

        if (formation.getCreatedBy() != null) {
            this.createdBy = formation.getCreatedBy().getId();
        }

        if (formation.getParticipants() != null) {
            this.participants = formation.getParticipants().stream()
                    .map(Employee::getId) // MAINTENANT Employee EST IMPORTÉ
                    .collect(Collectors.toSet());
        }
    }
}