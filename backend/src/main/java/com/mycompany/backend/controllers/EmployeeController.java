package com.mycompany.backend.controllers;

import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.services.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    @PreAuthorize("hasRole('HR') or hasRole('HRMANAGER')")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());// Délégation à EmployeeService
    }


    // Récupérer un employé par son ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('HR') or hasRole('HRMANAGER')")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable String id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // Mettre à jour un employé par ID
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR') or hasRole('HRMANAGER')")
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
    // Télécharger une photo pour un employé
    @PostMapping("/{id}/upload-photo")
    @PreAuthorize("hasRole('HR') or hasRole('HRMANAGER')")
    public ResponseEntity<Employee> uploadPhoto(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file
    ) {
        Optional<Employee> optionalEmployee = employeeService.getEmployeeById(id);

        if (optionalEmployee.isEmpty()) {
            return ResponseEntity.status(404).body(null);
        }

        Employee employee = optionalEmployee.get();

        try {
            String fileName = employeeService.storeEmployeePhoto(id, file);
            // URL complète pour Angular
            employee.setPhotoUrl("http://localhost:8081/uploads/" + fileName);

            Employee saved = employeeService.saveEmployee(employee);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(null);
        }
    }




    // Supprimer un employé par ID
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HRMANAGER')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable String id) {
        Optional<Employee> employee = employeeService.getEmployeeById(id);
        if (employee.isPresent()) {
            employeeService.deleteEmployee(id);
            return ResponseEntity.noContent().build(); // code 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // code 404 si pas trouvé
        }
    }

}
