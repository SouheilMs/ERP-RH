package com.mycompany.backend.services;

import com.mycompany.backend.dto.EmployeeDTO;
import com.mycompany.backend.entities.Employee;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;

public interface EmployeeService {

    List<Employee> getAllEmployees();
    Optional<Employee> getEmployeeById(Long id);
    Optional<Employee> getEmployeeByUsername(String username);
    Employee saveEmployee(Employee employee);
    Employee createEmployee(Employee employee);
    Optional<Employee> getEmployeeByEmail(String email);
    void deleteEmployee(Long id);
    ResponseEntity<?> registerNewEmployee(EmployeeDTO employeeDTO, final HttpServletRequest request);
}