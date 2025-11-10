
package com.mycompany.backend.controllers;

import com.mycompany.backend.dto.EmployeeDTO;
import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.services.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.*;


import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
        return ResponseEntity.ok(employeeService.getAllEmployees());// Délégation à EmployeeService
    }

    // Détails d'un employé par username
    @GetMapping("/username/{username}")
    public ResponseEntity<Employee> getEmployeeByUsername(@PathVariable String username) {
        return employeeService.getEmployeeByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Récupérer un employé par son ID
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable String id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Supprimer un employé
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok("Employé supprimé avec succès");
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

  

    // Créer un employé
    @PostMapping("/Add-employee")
    public ResponseEntity<?> registerNewEmployee(@RequestBody @Valid EmployeeDTO employeeDTO, final HttpServletRequest request) {
        return employeeService.registerNewEmployee(employeeDTO, request);
    }
    //Exporter
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportEmployees() throws IOException {
        ByteArrayOutputStream out = employeeService.exportToExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("employees.xlsx")
                .build());
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok()
                .headers(headers)
                .body(out.toByteArray());
    }
    // Importer
    @PostMapping("/import")
    public ResponseEntity<String> importEmployees(@RequestParam("file") MultipartFile file) {
        try {
            employeeService.ImportFromExcel(file);
            return ResponseEntity.ok("Fichier importé avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'import : " + e.getMessage());
        }
    }
}

