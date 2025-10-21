package com.mycompany.backend.controllers;

import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.services.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    // Liste tous les employés
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    // Détails d’un employé par username
    @GetMapping("/username/{username}")
    public ResponseEntity<Employee> getEmployeeByUsername(@PathVariable String username) {
        return employeeService.getEmployeeByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Mettre à jour un employé par username
    @PutMapping("/username/{username}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable String username,
            @RequestBody Employee updatedEmployee
    ) {
        return employeeService.getEmployeeByUsername(username)
                .map(existingEmployee -> {
                    updatedEmployee.setId(existingEmployee.getId());
                    Employee savedEmployee = employeeService.saveEmployee(updatedEmployee);
                    return ResponseEntity.ok(savedEmployee);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Récupérer un employé par son ID
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable String id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // Mettre à jour un employé par ID
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployeeById(
            @PathVariable String id,
            @RequestBody Employee updatedEmployee
    ) {
        return employeeService.getEmployeeById(id)
                .map(existingEmployee -> {
                    updatedEmployee.setId(existingEmployee.getId());
                    Employee saved = employeeService.saveEmployee(updatedEmployee);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

}
