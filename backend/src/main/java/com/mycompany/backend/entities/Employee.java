package com.mycompany.backend.entities;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Data
@Getter
@Setter
@Document(collection = "employees")
public class Employee {

    @Id
    private String id;
    private String username;
    private String email;
    private String phone;
    private String password;
    private Date hireDate;
    private Double salary;
    private String status;

    @DBRef
    private Set<Role> roles = new HashSet<>();

    public Employee() {
    }

    public Employee(String username,  String email, String phone,
                    String password, Date hireDate, Double salary, String status) {

        this.username = username;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.hireDate = hireDate;
        this.salary = salary;
        this.status = status;

    }

    public Employee(String username, String email, String encode) {
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    public void setEmail(String email) { this.email = email; }
    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }


}
