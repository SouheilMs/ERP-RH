package com.mycompany.backend.dto;

import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.entities.Role;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeGetDTO {
    private String id;
    private String username;
    private String email;
    private List<String> roleName;

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    public List<String> getRoleName() {
        return roleName;
    }

    public void setRoleName(List<String> roleName) {
        this.roleName = roleName;
    }

    public static EmployeeGetDTO EmployeeToEmployeeDto(Employee employee) {
        EmployeeGetDTO employeeGetDTO = new EmployeeGetDTO();
        employeeGetDTO.setId(employee.getId());
        employeeGetDTO.setUsername(employee.getUsername());
        employeeGetDTO.setEmail(employee.getEmail());

        List<String> names = new ArrayList<>();
        Set<Role> roles = employee.getRoles();
        for (Role role : roles) {
            // Utilisez getName() qui retourne l'enum ERole, puis name() pour le String
            names.add(role.getName().name());
        }
        employeeGetDTO.setRoleName(names);
        return employeeGetDTO;
    }

    public static List<EmployeeGetDTO> EmployeesToEmployeeDtos(List<Employee> employees) {
        List<EmployeeGetDTO> employeeDtos = new ArrayList<>();
        for (Employee employee : employees) {
            employeeDtos.add(EmployeeToEmployeeDto(employee));
        }
        return employeeDtos;
    }
}