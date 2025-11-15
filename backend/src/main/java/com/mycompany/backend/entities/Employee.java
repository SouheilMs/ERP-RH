package com.mycompany.backend.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.ArrayList;
@Data
@Document(collection = "employees")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Employee {

    @Id
    private String id;
    private String username;
    private String email;
    private String phone;
    private String password;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date hireDate;

    private Double salary;
    private String status;

    // ✅ NOUVEAUX CHAMPS POUR FICHE DE PAIE TUNISIENNE
    private String cin; // Carte d'identité nationale
    private String cnssNumber; // Numéro de sécurité sociale
    private String position; // Poste/Fonction
    private String address; // Adresse
    private String city; // Ville
    private String matricule; // Matricule interne
    private String rib; // RIB bancaire
    private String bankName; // Nom de la banque
    private Integer workingDays = 22; // Jours travaillés par défaut
    private Integer actualWorkingDays = 22; // Jours réellement travaillés
    private Double transportAllowance = 0.0; // Indemnité de transport
    private Double familyAllowance = 0.0; // Allocation familiale
    private Double otherBonuses = 0.0; // Autres primes

    // ✅ Stockage de l'ID de la photo dans GridFS
    private String photoId;

    @DBRef
    private Set<Role> roles = new HashSet<>();

    @DBRef
    @JsonIgnoreProperties("employee") // évite boucle infinie JSON
    private List<formation> formations = new ArrayList<>();

    public Employee() {}

    public Employee(String username, String email, String phone,
                    String password, Date hireDate, Double salary, String status) {
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.hireDate = hireDate;
        this.salary = salary;
        this.status = status;
    }

    public Employee(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}
