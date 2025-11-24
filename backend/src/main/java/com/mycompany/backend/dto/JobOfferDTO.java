package com.mycompany.backend.dto;

import com.mycompany.backend.entities.JobOffer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

public class JobOfferDTO {
    private String id;
    private String title;
    private String description;
    private String department;
    private String location;
    private String contractType;
    private String requirements;
    private String responsibilities;
    private String benefits;
    private JobOffer.JobOfferStatus status;
    private String publishedBy;
    private LocalDate publishedDate; // ✅ Changé de LocalDateTime à LocalDate
    private LocalDate closingDate;   // ✅ Changé de LocalDateTime à LocalDate
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String linkedInPostId;
    private Set<String> externalPlatforms;
    private Integer applicationCount;
    private Integer viewCount;
    private Set<String> tags;
    private String experienceLevel;
    private String educationRequired;
    private Boolean isActive;

    // Constructors
    public JobOfferDTO() {}

    public JobOfferDTO(JobOffer jobOffer) {
        this.id = jobOffer.getId();
        this.title = jobOffer.getTitle();
        this.description = jobOffer.getDescription();
        this.department = jobOffer.getDepartment();
        this.location = jobOffer.getLocation();
        this.contractType = jobOffer.getContractType();
        this.requirements = jobOffer.getRequirements();
        this.responsibilities = jobOffer.getResponsibilities();
        this.benefits = jobOffer.getBenefits();
        this.status = jobOffer.getStatus();
        this.publishedBy = jobOffer.getPublishedBy() != null ? jobOffer.getPublishedBy().getId() : null;
        this.publishedDate = jobOffer.getPublishedDate(); // ✅ LocalDate
        this.closingDate = jobOffer.getClosingDate();     // ✅ LocalDate
        this.createdAt = jobOffer.getCreatedAt();
        this.updatedAt = jobOffer.getUpdatedAt();
        this.linkedInPostId = jobOffer.getLinkedInPostId();
        this.externalPlatforms = jobOffer.getExternalPlatforms();
        this.applicationCount = jobOffer.getApplicationCount();
        this.viewCount = jobOffer.getViewCount();
        this.tags = jobOffer.getTags();
        this.experienceLevel = jobOffer.getExperienceLevel();
        this.educationRequired = jobOffer.getEducationRequired();
        this.isActive = jobOffer.getIsActive();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getContractType() { return contractType; }
    public void setContractType(String contractType) { this.contractType = contractType; }

    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }

    public String getResponsibilities() { return responsibilities; }
    public void setResponsibilities(String responsibilities) { this.responsibilities = responsibilities; }

    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }

    public JobOffer.JobOfferStatus getStatus() { return status; }
    public void setStatus(JobOffer.JobOfferStatus status) { this.status = status; }

    public String getPublishedBy() { return publishedBy; }
    public void setPublishedBy(String publishedBy) { this.publishedBy = publishedBy; }

    public LocalDate getPublishedDate() { return publishedDate; }
    public void setPublishedDate(LocalDate publishedDate) { this.publishedDate = publishedDate; }

    public LocalDate getClosingDate() { return closingDate; }
    public void setClosingDate(LocalDate closingDate) { this.closingDate = closingDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getLinkedInPostId() { return linkedInPostId; }
    public void setLinkedInPostId(String linkedInPostId) { this.linkedInPostId = linkedInPostId; }

    public Set<String> getExternalPlatforms() { return externalPlatforms; }
    public void setExternalPlatforms(Set<String> externalPlatforms) { this.externalPlatforms = externalPlatforms; }

    public Integer getApplicationCount() { return applicationCount; }
    public void setApplicationCount(Integer applicationCount) { this.applicationCount = applicationCount; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getEducationRequired() { return educationRequired; }
    public void setEducationRequired(String educationRequired) { this.educationRequired = educationRequired; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    // Helper methods
    public boolean isExpired() {
        return this.closingDate != null && LocalDate.now().isAfter(this.closingDate);
    }

    public boolean isPublished() {
        return JobOffer.JobOfferStatus.PUBLISHED.equals(this.status);
    }
}