package com.mycompany.backend.controllers;

import com.mycompany.backend.dto.EmployeeDTO;
import com.mycompany.backend.dto.EmployeeDetailDTO;
import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.services.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Controller
@RequestMapping("/th/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    // AJOUTER CE CONSTRUCTEUR
    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // ==================== PAGES THYMELEAF ====================

    // Page liste des employés (GET - affichage)
    @GetMapping
    @PreAuthorize("hasRole('HR') or hasRole('HRMANAGER')")
    public String showEmployeesPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Model model) {

        // Pour Thymeleaf, on peut utiliser getAllEmployees() simple
        // OU adapter la pagination côté serveur

        List<Employee> employees = employeeService.getAllEmployees();
        model.addAttribute("employees", employees);
        model.addAttribute("currentPage", page);
        model.addAttribute("pageSize", size);
        model.addAttribute("search", search);

        return "employees/list";
    }

    // Page détail employé
    @GetMapping("/{id}")
    public String showEmployeeDetail(@PathVariable String id, Model model) {
        try {
            EmployeeDetailDTO employee = convertToEmployeeDetailDTO(id);
            model.addAttribute("employee", employee);
            return "employees/detail";
        } catch (Exception e) {
            model.addAttribute("error", "Employee not found");
            return "redirect:/th/employees";
        }
    }

    // Formulaire création employé
    @GetMapping("/new")
    @PreAuthorize("hasRole('HRMANAGER')")
    public String showCreateForm(Model model) {
        model.addAttribute("employee", new EmployeeDTO());
        return "employees/form";
    }

    // Formulaire modification employé
    @GetMapping("/{id}/edit")
    @PreAuthorize("hasRole('HR') or hasRole('HRMANAGER')")
    public String showEditForm(@PathVariable String id, Model model) {
        try {
            EmployeeDetailDTO employee = convertToEmployeeDetailDTO(id);
            model.addAttribute("employee", employee);
            return "employees/form";
        } catch (Exception e) {
            model.addAttribute("error", "Employee not found");
            return "redirect:/th/employees";
        }
    }

    // ==================== ACTIONS ====================

    // Création employé
    @PostMapping
    @PreAuthorize("hasRole('HRMANAGER')")
    public String createEmployee(@ModelAttribute EmployeeDTO employeeDTO,
                                 RedirectAttributes redirectAttributes) {
        try {
            // Appeler votre service existant
            employeeService.registerNewEmployee(employeeDTO, null);
            redirectAttributes.addFlashAttribute("success", "Employee created successfully!");
            return "redirect:/th/employees";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error: " + e.getMessage());
            return "redirect:/th/employees/new";
        }
    }

    // Modification employé
    @PostMapping("/{id}")
    @PreAuthorize("hasRole('HR') or hasRole('HRMANAGER')")
    public String updateEmployee(@PathVariable String id,
                                 @ModelAttribute EmployeeDetailDTO employeeDTO,
                                 RedirectAttributes redirectAttributes) {
        try {
            // Convertir EmployeeDetailDTO en Employee et mettre à jour
            // Vous devez créer cette méthode dans le service
            redirectAttributes.addFlashAttribute("success", "Employee updated successfully!");
            return "redirect:/th/employees/" + id;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error: " + e.getMessage());
            return "redirect:/th/employees/" + id + "/edit";
        }
    }

    // Suppression employé
    @PostMapping("/{id}/delete")
    @PreAuthorize("hasRole('HRMANAGER')")
    public String deleteEmployee(@PathVariable String id,
                                 RedirectAttributes redirectAttributes) {
        try {
            employeeService.deleteEmployee(id);
            redirectAttributes.addFlashAttribute("success", "Employee deleted successfully!");
            return "redirect:/th/employees";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error: " + e.getMessage());
            return "redirect:/th/employees/" + id;
        }
    }

    // Export Excel
    @GetMapping("/export")
    @PreAuthorize("hasRole('HR') or hasRole('HRMANAGER')")
    public String exportEmployees(RedirectAttributes redirectAttributes) {
        try {
            ByteArrayOutputStream out = employeeService.exportToExcel();
            // Ici, vous devriez gérer le téléchargement du fichier
            redirectAttributes.addFlashAttribute("info", "Export functionality to be implemented");
            return "redirect:/th/employees";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error exporting: " + e.getMessage());
            return "redirect:/th/employees";
        }
    }

    // Import Excel
    @PostMapping("/import")
    @PreAuthorize("hasRole('HRMANAGER')")
    public String importEmployees(@RequestParam("file") MultipartFile file,
                                  RedirectAttributes redirectAttributes) {
        try {
            employeeService.importFromExcel(file);
            redirectAttributes.addFlashAttribute("success", "Employees imported successfully!");
            return "redirect:/th/employees";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error importing: " + e.getMessage());
            return "redirect:/th/employees";
        }
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    private EmployeeDetailDTO convertToEmployeeDetailDTO(String id) {
        // Utilisez votre service existant
        var employeeOpt = employeeService.getEmployeeById(id);
        if (employeeOpt.isEmpty()) {
            throw new RuntimeException("Employee not found");
        }

        Employee employee = employeeOpt.get();
        EmployeeDetailDTO dto = new EmployeeDetailDTO();

        // Copier les propriétés
        dto.setId(employee.getId());
        dto.setUsername(employee.getUsername());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setPosition(employee.getPosition());
        dto.setStatus(employee.getStatus());
        dto.setSalary(employee.getSalary());
        dto.setHireDate(employee.getHireDate());
        dto.setCin(employee.getCin());
        dto.setCnssNumber(employee.getCnssNumber());
        dto.setAddress(employee.getAddress());
        dto.setCity(employee.getCity());
        dto.setMatricule(employee.getMatricule());
        dto.setRib(employee.getRib());
        dto.setBankName(employee.getBankName());
        dto.setWorkingDays(employee.getWorkingDays());
        dto.setActualWorkingDays(employee.getActualWorkingDays());
        dto.setTransportAllowance(employee.getTransportAllowance());
        dto.setFamilyAllowance(employee.getFamilyAllowance());
        dto.setOtherBonuses(employee.getOtherBonuses());
        dto.setSeniorityBonus(employee.getSeniorityBonus());
        dto.setYearsOfService(employee.getYearsOfService());

        return dto;
    }
}