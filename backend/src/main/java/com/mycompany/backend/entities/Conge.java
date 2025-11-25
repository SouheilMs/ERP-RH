package com.mycompany.backend.entities;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "conges")
public class Conge {
    @Id
    private String id;
    private String employeeId; // CHAMP OBLIGATOIRE
    private String type;
    private Date startDate;
    private Date endDate;
    private String status;

    // Constructeurs
    public Conge() {}

    public Conge(String employeeId, String type, Date startDate, Date endDate, String status) {
        this.employeeId = employeeId;
        this.type = type;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    public void setType(String type) {
        this.type = type;
    }
}