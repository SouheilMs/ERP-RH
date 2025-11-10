package com.mycompany.backend.services;

import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.repositories.EmployeeRepository;
import com.mycompany.backend.services.Impl.EmployeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee employee;
    private Employee employee2;

    @BeforeEach
    void setUp() {
        employee = new Employee(1L, "John", "Doe", "john.doe@company.com", "IT");
        employee2 = new Employee(2L, "Jane", "Smith", "jane.smith@company.com", "HR");
    }

    @Test
    void findAll_ShouldReturnAllEmployees() {
        // Given
        List<Employee> expectedEmployees = Arrays.asList(employee, employee2);
        when(employeeRepository.findAll()).thenReturn(expectedEmployees);

        // When
        List<Employee> result = employeeService.findAll();

        // Then
        assertEquals(2, result.size());
        assertEquals("John", result.get(0).getFirstName());
        verify(employeeRepository, times(1)).findAll();
    }

    @Test
    void findById_WhenEmployeeExists_ShouldReturnEmployee() {
        // Given
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        // When
        Optional<Employee> result = employeeService.findById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals("John", result.get().getFirstName());
        verify(employeeRepository, times(1)).findById(1L);
    }

    @Test
    void findById_WhenEmployeeNotExists_ShouldReturnEmpty() {
        // Given
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        // When
        Optional<Employee> result = employeeService.findById(99L);

        // Then
        assertFalse(result.isPresent());
        verify(employeeRepository, times(1)).findById(99L);
    }

    @Test
    void save_ShouldReturnSavedEmployee() {
        // Given
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        // When
        Employee result = employeeService.save(employee);

        // Then
        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        verify(employeeRepository, times(1)).save(employee);
    }

    @Test
    void deleteById_ShouldCallRepository() {
        // Given
        doNothing().when(employeeRepository).deleteById(1L);

        // When
        employeeService.deleteById(1L);

        // Then
        verify(employeeRepository, times(1)).deleteById(1L);
    }

    @Test
    void findByEmail_WhenEmployeeExists_ShouldReturnEmployee() {
        // Given
        String email = "john.doe@company.com";
        when(employeeRepository.findByEmail(email)).thenReturn(Optional.of(employee));

        // When
        Optional<Employee> result = employeeService.findByEmail(email);

        // Then
        assertTrue(result.isPresent());
        assertEquals(email, result.get().getEmail());
        verify(employeeRepository, times(1)).findByEmail(email);
    }
}