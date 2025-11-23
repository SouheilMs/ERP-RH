package com.mycompany.backend.payload.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CongeRequestDTO {
    private String type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
}
