package com.mycompany.backend.services;
import com.mycompany.backend.dto.EmployeeDTO;
import com.mycompany.backend.dto.LeaveBalanceDTO;
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



    // Gestion des fichiers (photos et formations)
    String storeEmployeePhoto(String id, MultipartFile file); // retourne photoId
    String storeFormationFile(MultipartFile file);           // retourne URL ou ID du PDF
    byte[] generatePaySlipPDF(String employeeId) throws Exception; // génère un PDF de bulletin de salaire
    // NOUVELLES MÉTHODES POUR LES CONGÉS
    List<LeaveBalanceDTO> getEmployeeLeaveBalances(String employeeId);
    LeaveBalanceDTO getEmployeeLeaveBalanceByType(String employeeId, String leaveType);
    double calculateUsedLeaveDays(String employeeId, String leaveType);
    double calculateRemainingLeaveDays(String employeeId, String leaveType);
}

