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

    //  NOUVEAUX CHAMPS POUR FICHE DE PAIE TUNISIENNE
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

    //  Stockage de l'ID de la photo dans GridFS
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

    public Employee(String username, String email, String password, String encode) {
        this.username = username;
        this.email = email;
        this.password = encode;
    }

    // Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Date getHireDate() { return hireDate; }
    public void setHireDate(Date hireDate) { this.hireDate = hireDate; }
    public Double getSalary() { return salary; }
    public void setSalary(Double salary) { this.salary = salary; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    public String getCin() {
        return cin;
    }

    public void setCin(String cin) {
        this.cin = cin;
    }

    public String getCnssNumber() {
        return cnssNumber;
    }

    public void setCnssNumber(String cnssNumber) {
        this.cnssNumber = cnssNumber;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getMatricule() {
        return matricule;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

    public String getRib() {
        return rib;
    }

    public void setRib(String rib) {
        this.rib = rib;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public Integer getWorkingDays() {
        return workingDays;
    }

    public void setWorkingDays(Integer workingDays) {
        this.workingDays = workingDays;
    }

    public Integer getActualWorkingDays() {
        return actualWorkingDays;
    }

    public void setActualWorkingDays(Integer actualWorkingDays) {
        this.actualWorkingDays = actualWorkingDays;
    }

    public Double getTransportAllowance() {
        return transportAllowance;
    }

    public void setTransportAllowance(Double transportAllowance) {
        this.transportAllowance = transportAllowance;
    }

    public Double getFamilyAllowance() {
        return familyAllowance;
    }

    public void setFamilyAllowance(Double familyAllowance) {
        this.familyAllowance = familyAllowance;
    }

    public Double getOtherBonuses() {
        return otherBonuses;
    }

    public void setOtherBonuses(Double otherBonuses) {
        this.otherBonuses = otherBonuses;
    }

    public String getPhotoId() {
        return photoId;
    }

    public void setPhotoId(String photoId) {
        this.photoId = photoId;
    }

    public List<formation> getFormations() {
        return formations;
    }

    public void setFormations(List<formation> formations) {
        this.formations = formations;
    }
}
