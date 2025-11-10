package com.mycompany.backend.services;

import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository ;// Dépend d'une abstraction (interface), pas d'une implémentation concrète

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();// Logique métier : récupérer tous les employés
    }
    public Optional<Employee> getEmployeeById(String id) {
        return employeeRepository.findById(id);
    }
    public Employee saveEmployee(Employee employee) {
        // Logique existante
        return employeeRepository.save(employee);
    }

    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
    }
    // Méthode pour stocker la photo d'un employé
    public String storeEmployeePhoto(String id, MultipartFile file) throws IOException {
        // chemin vers backend/uploads
        Path uploadsDir = Paths.get("backend/uploads");
        Files.createDirectories(uploadsDir);

        String fileName = id + "_" + file.getOriginalFilename();
        Path filePath = uploadsDir.resolve(fileName);
        Files.write(filePath, file.getBytes());

        return fileName; // NE PAS mettre /uploads/ ici, c’est juste le nom du fichier
    }






}
