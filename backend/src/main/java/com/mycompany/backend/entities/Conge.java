package com.mycompany.backend.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conges")
public class Conge {

    @Id
    private String id;

    private String employeeId;

    private String employeeName;

    private String type; // ANNUAL, SICK, UNPAID, MATERNITY, etc.

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer duration;

    private String reason;

    private String status; // PENDING, APPROVED, REJECTED

    private String rejectionReason;

    private LocalDateTime submissionDate;

    private LocalDateTime responseDate;

    private String respondedBy; // Manager/HR who approved or rejected

    // Calculate duration in days
    public void calculateDuration() {
        if (startDate != null && endDate != null) {
            this.duration = (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        }
    }
}