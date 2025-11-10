package com.mycompany.backend.services;
import com.mycompany.backend.dto.EmployeeDTO;
import com.mycompany.backend.entities.Employee;

import jakarta.servlet.http.HttpServletRequest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface EmployeeService {

    List<Employee> getAllEmployees();

    Optional<Employee> getEmployeeById(String id);

    Optional<Employee> getEmployeeByUsername(String username);

    Employee saveEmployee(Employee employee);

    Employee createEmployee(Employee employee);

    Optional<Employee> getEmployeeByEmail(String email);

    void deleteEmployee(String id);

    ResponseEntity<?> registerNewEmployee(EmployeeDTO employeeDTO, final HttpServletRequest request);

    void ImportFromExcel(MultipartFile file) throws IOException;

    ByteArrayOutputStream exportToExcel() throws IOException;

    String storeEmployeePhoto(String id, MultipartFile file);

}