package com.mycompany.backend.entities;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "notifications")

public class Notification {
    @Id
    private String notificationId;
    private String message;
    private Date date;

    public void setMessage(String message) {
        this.message = message;
    }
}