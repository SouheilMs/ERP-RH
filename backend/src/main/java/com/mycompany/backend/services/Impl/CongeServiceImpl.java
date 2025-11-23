package com.mycompany.backend.services.Impl;

import com.mycompany.backend.payload.request.CongeRequestDTO;
import com.mycompany.backend.payload.response.CongeStatusUpdateDTO;
import com.mycompany.backend.entities.Conge;
import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.repositories.CongeRepository;
import com.mycompany.backend.repositories.EmployeeRepository;
import com.mycompany.backend.services.CongeService;
import com.mycompany.backend.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CongeServiceImpl implements CongeService {

    @Autowired
    private CongeRepository congeRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private NotificationService notificationService;

    public Conge submitCongeRequest(String employeeId, CongeRequestDTO requestDTO) {
        // Get employee information
        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            throw new RuntimeException("Employee not found");
        }

        Employee employee = employeeOpt.get();

        // Validate dates
        if (requestDTO.getEndDate().isBefore(requestDTO.getStartDate())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        // Create new conge
        Conge conge = new Conge();
        conge.setEmployeeId(employeeId);
        conge.setEmployeeName(employee.getUsername()); // or employee.getFullName() if available
        conge.setType(requestDTO.getType());
        conge.setStartDate(requestDTO.getStartDate());
        conge.setEndDate(requestDTO.getEndDate());
        conge.setReason(requestDTO.getReason());
        conge.setStatus("PENDING");
        conge.setSubmissionDate(LocalDateTime.now());

        // Calculate duration
        conge.calculateDuration();

        return congeRepository.save(conge);
    }

    public List<Conge> getEmployeeConges(String employeeId) {
        return congeRepository.findByEmployeeId(employeeId);
    }

    public List<Conge> getAllPendingConges() {
        return congeRepository.findByStatusOrderBySubmissionDateDesc("PENDING");
    }

    public List<Conge> getAllConges() {
        return congeRepository.findAll();
    }

    public Optional<Conge> getCongeById(String congeId) {
        return congeRepository.findById(congeId);
    }

    public Conge updateCongeStatus(String congeId, String managerId, CongeStatusUpdateDTO statusDTO) {
        Optional<Conge> congeOpt = congeRepository.findById(congeId);

        if (congeOpt.isEmpty()) {
            throw new RuntimeException("Conge not found");
        }

        Conge conge = congeOpt.get();

        // Check if conge is already processed
        if (!conge.getStatus().equals("PENDING")) {
            throw new RuntimeException("This conge request has already been processed");
        }

        // Get manager information
        Optional<Employee> managerOpt = employeeRepository.findById(managerId);
        String managerName = managerOpt.map(Employee::getUsername).orElse("Unknown");

        // Update status
        conge.setStatus(statusDTO.getStatus());
        conge.setResponseDate(LocalDateTime.now());
        conge.setRespondedBy(managerName);

        if (statusDTO.getStatus().equals("REJECTED")) {
            conge.setRejectionReason(statusDTO.getRejectionReason());
        }

        return congeRepository.save(conge);
    }

    public void deleteConge(String congeId, String employeeId) {
        Optional<Conge> congeOpt = congeRepository.findById(congeId);

        if (congeOpt.isEmpty()) {
            throw new RuntimeException("Conge not found");
        }

        Conge conge = congeOpt.get();

        // Verify that the conge belongs to the employee
        if (!conge.getEmployeeId().equals(employeeId)) {
            throw new RuntimeException("Unauthorized to delete this conge");
        }

        // Only allow deletion of pending requests
        if (!conge.getStatus().equals("PENDING")) {
            throw new RuntimeException("Cannot delete a processed conge request");
        }

        congeRepository.deleteById(congeId);
    }
}