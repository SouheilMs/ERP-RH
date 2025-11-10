package com.mycompany.backend.entities;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "jobOffers")
public class JobOffer {
    @Id
    private String id;
    private String title;
    private String description;
    private Date publicationDate;
    private String status;

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}