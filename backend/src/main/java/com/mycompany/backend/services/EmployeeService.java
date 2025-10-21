package com.mycompany.backend.services;

import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(String id) {
        return employeeRepository.findById(id);
    }
    public Optional<Employee> getEmployeeByEmail(String email) {   // <-- ajout ici
        return employeeRepository.findByEmail(email);
    }
    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }
    public Optional<Employee> getEmployeeByUsername(String username) {
        return employeeRepository.findByUsername(username);
    }


    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
    }

}
