package com.mycompany.backend.services.Impl;

import com.mycompany.backend.dto.EmployeeDTO;
import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.entities.Role;
import com.mycompany.backend.entities.ERole;
import com.mycompany.backend.repositories.EmployeeRepository;
import com.mycompany.backend.repositories.RoleRepository;
import com.mycompany.backend.services.EmailService;
import com.mycompany.backend.services.EmployeeService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(String.valueOf(id));
    }

    @Override
    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(String.valueOf(id));
    }

    @Override
    public Optional<Employee> getEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email);
    }

    @Override
    public Optional<Employee> getEmployeeByUsername(String username) {
        return employeeRepository.findByUsername(username);
    }

    @Override
    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public Employee createEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public ResponseEntity<?> registerNewEmployee(EmployeeDTO employeeDTO, final HttpServletRequest request) {
        boolean employeeExists = employeeRepository.existsByEmail(employeeDTO.getEmail());

        if (employeeExists) {
            return ResponseEntity.badRequest()
                    .body("Employee with provided email already exists!");
        }

        // Create new employee
        Employee employee = new Employee();
        employee.setUsername(employeeDTO.getUsername());
        employee.setEmail(employeeDTO.getEmail());
        employee.setPhone(employeeDTO.getPhone());
        employee.setPassword(passwordEncoder.encode(employeeDTO.getPassword()));
        employee.setHireDate(employeeDTO.getHireDate());
        employee.setSalary(employeeDTO.getSalary());
        employee.setStatus(employeeDTO.getStatus());

        // Set default role if not specified
        Set<Role> roles = new HashSet<>();
        Role employeeRole = roleRepository.findByName(ERole.ROLE_EMPLOYEE)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(employeeRole);

        employee.setRoles(roles);
        Employee savedEmployee = employeeRepository.save(employee);

        // Send email with credentials
        try {
            emailService.sendEmployeeCredentials(
                    savedEmployee.getEmail(),
                    savedEmployee.getUsername(),
                    employeeDTO.getPassword() // Send the plain password for first login
            );
        } catch (Exception e) {
            // Log the error but don't fail the request
            System.err.println("Failed to send email: " + e.getMessage());
        }

        return ResponseEntity.ok("Employee registered successfully!");
    }
}