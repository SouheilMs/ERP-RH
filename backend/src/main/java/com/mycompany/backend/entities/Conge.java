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
    private String type;
    private Date startDate;
    private Date endDate;
    private String status;

    public void setType(String type) {
        this.type= type;
    }
}
