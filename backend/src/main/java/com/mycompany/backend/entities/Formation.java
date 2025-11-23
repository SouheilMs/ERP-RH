package com.mycompany.backend.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "formations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Formation {

    @Id
    private String id;
    private String name;
    private String location;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    // ✅ Stockage de l’ID GridFS du PDF de la formation
    private String certificateId;

    @DBRef
    @JsonIgnoreProperties("formations")
    private Employee employee;

    public Formation() {}
}
