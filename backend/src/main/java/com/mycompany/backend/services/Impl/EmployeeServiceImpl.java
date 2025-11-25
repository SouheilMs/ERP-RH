package com.mycompany.backend.services.Impl;

import com.mycompany.backend.dto.EmployeeDTO;
import com.mycompany.backend.dto.LeaveBalanceDTO;
import com.mycompany.backend.entities.Conge;
import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.entities.Role;
import com.mycompany.backend.entities.ERole;
import com.mycompany.backend.repositories.CongeRepository;
import com.mycompany.backend.repositories.EmployeeRepository;
import com.mycompany.backend.repositories.FormationRepository;
import com.mycompany.backend.repositories.RoleRepository;
import com.mycompany.backend.services.EmailService;
import com.mycompany.backend.services.EmployeeService;
import com.mycompany.backend.services.GridFsService;

import jakarta.servlet.http.HttpServletRequest;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class EmployeeServiceImpl implements EmployeeService {
    private final CongeRepository congeRepository;
    @Autowired
    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               CongeRepository congeRepository) {
        this.employeeRepository = employeeRepository;
        this.congeRepository = congeRepository;
    }
    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private GridFsService gridFsService;

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public Optional<Employee> getEmployeeById(String id) {
        return employeeRepository.findById(id);
    }

    @Override
    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
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
    public ResponseEntity<?> registerNewEmployee(EmployeeDTO employeeDTO, HttpServletRequest request) {
        if (employeeRepository.existsByEmail(employeeDTO.getEmail())) {
            return ResponseEntity.badRequest().body("Employee with provided email already exists!");
        }

        Employee employee = new Employee();
        employee.setUsername(employeeDTO.getUsername());
        employee.setEmail(employeeDTO.getEmail());
        employee.setPhone(employeeDTO.getPhone());
        employee.setPassword(passwordEncoder.encode(employeeDTO.getPassword()));
        employee.setHireDate(employeeDTO.getHireDate());
        employee.setSalary(employeeDTO.getSalary());
        employee.setStatus(employeeDTO.getStatus());
        if (employeeDTO.getGender() != null && !employeeDTO.getGender().trim().isEmpty()) {
            String gender = employeeDTO.getGender().toUpperCase();
            if (!isValidGender(gender)) {
                return ResponseEntity.badRequest().body("Invalid gender value. Use: MALE, FEMALE, or OTHER");
            }
        }

        // Nouveaux champs
        employee.setCin(employeeDTO.getCin());
        employee.setCnssNumber(employeeDTO.getCnssNumber());
        employee.setPosition(employeeDTO.getPosition());
        employee.setAddress(employeeDTO.getAddress());
        employee.setCity(employeeDTO.getCity());
        employee.setMatricule(employeeDTO.getMatricule());
        employee.setRib(employeeDTO.getRib());
        employee.setBankName(employeeDTO.getBankName());
        employee.setWorkingDays(employeeDTO.getWorkingDays());
        employee.setActualWorkingDays(employeeDTO.getActualWorkingDays());
        employee.setTransportAllowance(employeeDTO.getTransportAllowance());
        employee.setFamilyAllowance(employeeDTO.getFamilyAllowance());
        employee.setOtherBonuses(employeeDTO.getOtherBonuses());
        if (employeeDTO.getGender() != null && !employeeDTO.getGender().trim().isEmpty()) {
            employee.setGender(employeeDTO.getGender().toUpperCase());
        }
        Set<Role> roles = new HashSet<>();
        Role employeeRole = roleRepository.findByName(ERole.ROLE_EMPLOYEE)
                .orElseThrow(() -> new RuntimeException("Error: Role not found."));
        roles.add(employeeRole);
        employee.setRoles(roles);

        Employee savedEmployee = employeeRepository.save(employee);

        try {
            emailService.sendEmployeeCredentials(
                    savedEmployee.getEmail(),
                    savedEmployee.getUsername(),
                    employeeDTO.getPassword()
            );
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        return ResponseEntity.ok("Employee registered successfully!");

    }

    @Override
    public void ImportFromExcel(MultipartFile file) throws IOException {
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            Employee emp = new Employee();
            emp.setEmail(getCellValue(row.getCell(1)));
            emp.setUsername(getCellValue(row.getCell(2)));
            employeeRepository.save(emp);
        }
        workbook.close();
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue();
    }
//  exportToExcel avec des en-têtes étendues
    @Override
    public ByteArrayOutputStream exportToExcel() throws IOException {
        List<Employee> employees = employeeRepository.findAll();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Employees");

        // En-têtes étendues
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID");
        header.createCell(1).setCellValue("Email");
        header.createCell(2).setCellValue("Nom");
        header.createCell(3).setCellValue("Téléphone");
        header.createCell(4).setCellValue("Salaire");
        header.createCell(5).setCellValue("Poste");
        header.createCell(6).setCellValue("CIN");
        header.createCell(7).setCellValue("CNSS");

        int rowNum = 1;
        for (Employee emp : employees) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(emp.getId() != null ? emp.getId() : "");
            row.createCell(1).setCellValue(emp.getEmail() != null ? emp.getEmail() : "");
            row.createCell(2).setCellValue(emp.getUsername() != null ? emp.getUsername() : "");
            row.createCell(3).setCellValue(emp.getPhone() != null ? emp.getPhone() : "");
            row.createCell(4).setCellValue(emp.getSalary() != null ? emp.getSalary() : 0.0);
            row.createCell(5).setCellValue(emp.getPosition() != null ? emp.getPosition() : "");
            row.createCell(6).setCellValue(emp.getCin() != null ? emp.getCin() : "");
            row.createCell(7).setCellValue(emp.getCnssNumber() != null ? emp.getCnssNumber() : "");
        }

        for (int i = 0; i < 8; i++) sheet.autoSizeColumn(i);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out;
    }
// Gestion des fichiers (photos et formations)
    @Override
    public String storeEmployeePhoto(String id, MultipartFile file) {
        try {
            return gridFsService.saveFile(file);
        } catch (IOException e) {
            throw new RuntimeException("Erreur GridFS", e);
        }
    }
// Génération du PDF du bulletin de salaire
    @Override
    public String storeFormationFile(MultipartFile file) {
        try {
            return gridFsService.saveFile(file);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier formation", e);
        }
    }
// Génération du PDF du bulletin de salaire
    @Override
    public byte[] generatePaySlipPDF(String employeeId) throws IOException {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             PDDocument document = new PDDocument()) {

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            PDPageContentStream content = new PDPageContentStream(document, page);
            float pageWidth = page.getMediaBox().getWidth();
            float margin = 50;
            float yPosition = 750;

            // ================= EN-TÊTE =================
            content.setFont(PDType1Font.HELVETICA_BOLD, 16);
            drawCenteredText(content, "FICHE DE PAIE - TUNISIE", pageWidth, yPosition);
            yPosition -= 20;

            // Informations entreprise
            content.setFont(PDType1Font.HELVETICA, 10);
            drawCenteredText(content, "ENTREPRISE TUNISIENNE SARL", pageWidth, yPosition);
            yPosition -= 12;
            drawCenteredText(content, "Avenue Habib Bourguiba - 1002 Tunis", pageWidth, yPosition);
            yPosition -= 12;
            drawCenteredText(content, "Tél: 71 000 000 - Matricule Fiscal: 12345678/A/M/000", pageWidth, yPosition);
            yPosition -= 12;
            drawCenteredText(content, "Code CNSS: TN12345678 - Numéro Employeur: 987654321", pageWidth, yPosition);
            yPosition -= 15;

            // Ligne séparatrice
            content.setLineWidth(1f);
            content.moveTo(margin, yPosition);
            content.lineTo(pageWidth - margin, yPosition);
            content.stroke();
            yPosition -= 20;

            // ================= INFORMATIONS EMPLOYÉ =================
            content.setFont(PDType1Font.HELVETICA_BOLD, 12);
            content.beginText();
            content.newLineAtOffset(margin, yPosition);
            content.showText("Période de paie: " + new SimpleDateFormat("MMMM yyyy").format(new Date()));
            content.endText();
            yPosition -= 20;

            // Informations employé
            content.setFont(PDType1Font.HELVETICA, 10);

            // Ligne 1
            drawEmployeeInfo(content, margin, yPosition,
                    "Matricule:", emp.getMatricule() != null ? emp.getMatricule() : emp.getId(),
                    "Nom & Prénom:", emp.getUsername());
            yPosition -= 15;

            // Ligne 2
            drawEmployeeInfo(content, margin, yPosition,
                    "CNSS:", emp.getCnssNumber() != null ? emp.getCnssNumber() : "Non renseigné",
                    "Fonction:", emp.getPosition() != null ? emp.getPosition() : "-");
            yPosition -= 15;

            // Ligne 3
            String hireDate = emp.getHireDate() != null ?
                    new SimpleDateFormat("dd/MM/yyyy").format(emp.getHireDate()) : "-";
            drawEmployeeInfo(content, margin, yPosition,
                    "Date embauche:", hireDate,
                    "N° CIN:", emp.getCin() != null ? emp.getCin() : "-");
            yPosition -= 30;

            // ================= CALCULS SALARIAUX =================
            Double baseSalary = emp.getSalary() != null ? emp.getSalary() : 0.0;
            Integer workingDays = emp.getWorkingDays() != null ? emp.getWorkingDays() : 22;
            Integer actualDays = emp.getActualWorkingDays() != null ? emp.getActualWorkingDays() : workingDays;

            // Salaire de base proportionnel
            Double proportionalSalary = baseSalary * actualDays / workingDays;

            // Cotisations sociales
            Double cnssEmployee = proportionalSalary * 0.0918; // 9.18% employé
            Double retirement = proportionalSalary * 0.035; // 3.5% retraite
            Double healthInsurance = proportionalSalary * 0.02; // 2% assurance maladie

            // Total des avantages
            Double transport = emp.getTransportAllowance() != null ? emp.getTransportAllowance() : 0.0;
            Double family = emp.getFamilyAllowance() != null ? emp.getFamilyAllowance() : 0.0;
            Double bonuses = emp.getOtherBonuses() != null ? emp.getOtherBonuses() : 0.0;
            Double totalBenefits = transport + family + bonuses;

            // Salaire brut total
            Double totalBrut = proportionalSalary + totalBenefits;

            // Assiette IRPP
            Double taxableIncome = totalBrut - cnssEmployee - retirement - healthInsurance;

            // Calcul IRPP
            Double irpp = calculateIRPP(taxableIncome);

            // Net à payer
            Double netSalary = taxableIncome - irpp;

            // ================= TABLEAU DES GAINS =================
            content.setFont(PDType1Font.HELVETICA_BOLD, 11);
            content.beginText();
            content.newLineAtOffset(margin, yPosition);
            content.showText("GAINS ET AVANTAGES");
            content.endText();
            yPosition -= 20;

            String[][] gainsData = {
                    {"Salaire de base (" + actualDays + "/" + workingDays + " j)", String.format("%.3f", proportionalSalary)},
                    {"Indemnité transport", String.format("%.3f", transport)},
                    {"Allocation familiale", String.format("%.3f", family)},
                    {"Autres primes", String.format("%.3f", bonuses)},
                    {"TOTAL BRUT", String.format("%.3f", totalBrut)}
            };

            for (String[] row : gainsData) {
                drawTableRow(content, margin, yPosition, row[0], row[1] + " TND");
                yPosition -= 15;
            }

            yPosition -= 10;

            // ================= TABLEAU DES RETENUES =================
            content.setFont(PDType1Font.HELVETICA_BOLD, 11);
            content.beginText();
            content.newLineAtOffset(margin, yPosition);
            content.showText("RETENUES SOCIALES");
            content.endText();
            yPosition -= 20;

            String[][] deductionsData = {
                    {"CNSS (9.18%)", String.format("%.3f", cnssEmployee)},
                    {"Retraite (3.5%)", String.format("%.3f", retirement)},
                    {"Assurance maladie (2%)", String.format("%.3f", healthInsurance)},
                    {"Impôt sur le revenu (IRPP)", String.format("%.3f", irpp)},
                    {"TOTAL RETENUES", String.format("%.3f", cnssEmployee + retirement + healthInsurance + irpp)}
            };

            for (String[] row : deductionsData) {
                drawTableRow(content, margin, yPosition, row[0], row[1] + " TND");
                yPosition -= 15;
            }

            yPosition -= 20;

            // ================= NET À PAYER =================
            content.setFont(PDType1Font.HELVETICA_BOLD, 12);
            content.beginText();
            content.newLineAtOffset(margin, yPosition);
            content.showText("NET À PAYER: " + String.format("%.3f", netSalary) + " TND");
            content.endText();

            // ================= SIGNATURES =================
            yPosition -= 40;
            content.setFont(PDType1Font.HELVETICA, 10);
            content.beginText();
            content.newLineAtOffset(margin + 30, yPosition);
            content.showText("Signature employé");
            content.newLineAtOffset(300, 0);
            content.showText("Signature employeur");
            content.endText();

            // Lignes de signatures
            content.setLineWidth(0.5f);
            content.moveTo(margin, yPosition - 10);
            content.lineTo(margin + 150, yPosition - 10);
            content.moveTo(margin + 200, yPosition - 10);
            content.lineTo(margin + 350, yPosition - 10);
            content.stroke();

            content.close();
            document.save(out);

            return out.toByteArray();
        }
    }

    // Méthode utilitaire pour le texte centré
    private void drawCenteredText(PDPageContentStream content, String text, float pageWidth, float y) throws IOException {
        content.beginText();
        float titleWidth = PDType1Font.HELVETICA.getStringWidth(text) / 1000 * 10;
        content.newLineAtOffset((pageWidth - titleWidth) / 2, y);
        content.showText(text);
        content.endText();
    }

    // Méthode utilitaire pour les informations employé
    private void drawEmployeeInfo(PDPageContentStream content, float margin, float y,
                                  String label1, String value1, String label2, String value2) throws IOException {
        content.beginText();
        content.newLineAtOffset(margin, y);
        content.showText(label1);
        content.newLineAtOffset(50, 0);
        content.showText(value1);
        content.newLineAtOffset(200, 0);
        content.showText(label2);
        content.newLineAtOffset(50, 0);
        content.showText(value2);
        content.endText();
    }

    // Méthode utilitaire pour les lignes de tableau
    private void drawTableRow(PDPageContentStream content, float margin, float y, String label, String value) throws IOException {
        content.setFont(PDType1Font.HELVETICA, 10);
        content.beginText();
        content.newLineAtOffset(margin + 10, y);
        content.showText(label);
        content.newLineAtOffset(300, 0);
        content.showText(value);
        content.endText();
    }

    // Méthode pour calculer l'IRPP selon le barème tunisien
    private Double calculateIRPP(Double taxableIncome) {
        if (taxableIncome == null || taxableIncome <= 5000) {
            return 0.0;
        } else if (taxableIncome <= 20000) {
            return (taxableIncome - 5000) * 0.26;
        } else if (taxableIncome <= 30000) {
            return (15000 * 0.26) + (taxableIncome - 20000) * 0.28;
        } else if (taxableIncome <= 50000) {
            return (15000 * 0.26) + (10000 * 0.28) + (taxableIncome - 30000) * 0.32;
        } else {
            return (15000 * 0.26) + (10000 * 0.28) + (20000 * 0.32) + (taxableIncome - 50000) * 0.35;
        }
    }
    @Override
    public List<LeaveBalanceDTO> getEmployeeLeaveBalances(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        List<LeaveBalanceDTO> result = new ArrayList<>();

        // BASIC LEAVE TYPES (Available to all employees)
        Map<String, Double> totalDays = new HashMap<>();
        totalDays.put("ANNUAL", 22.0);          // 22 standard annual days
        totalDays.put("SICK", 18.0);            // 18 sick days
        totalDays.put("UNPAID", 15.0);          // 15 max unpaid days
        totalDays.put("MARRIAGE", 7.0);         // Employee marriage
        totalDays.put("CHILD_MARRIAGE", 2.0);   // Child marriage
        totalDays.put("BIRTH", 1.0);            // Child birth
        totalDays.put("DEATH_SPOUSE", 7.0);     // Spouse death
        totalDays.put("DEATH_PARENT", 7.0);     // Parent death
        totalDays.put("TRAINING", 10.0);        // Professional training

        Map<String, String> labels = new HashMap<>();
        labels.put("ANNUAL", "Annual Leave");
        labels.put("SICK", "Sick Leave");
        labels.put("UNPAID", "Unpaid Leave");
        labels.put("MARRIAGE", "Employee Marriage");
        labels.put("CHILD_MARRIAGE", "Child's Marriage");
        labels.put("BIRTH", "Child Birth");
        labels.put("DEATH_SPOUSE", "Spouse Death");
        labels.put("DEATH_PARENT", "Parent Death");
        labels.put("TRAINING", "Training Leave");

        // GENDER-SPECIFIC LEAVES
        String gender = employee.getGender(); // Assuming you have gender field

        if ("FEMALE".equalsIgnoreCase(gender)) {
            totalDays.put("MATERNITY", 30.0);       // Only for female employees
            labels.put("MATERNITY", "Maternity Leave");
        }

        if ("MALE".equalsIgnoreCase(gender)) {
            totalDays.put("PATERNITY", 3.0);        // Only for male employees
            labels.put("PATERNITY", "Paternity Leave");
        }

        // Calculate for each leave type
        for (Map.Entry<String, Double> entry : totalDays.entrySet()) {
            String leaveType = entry.getKey();
            Double total = entry.getValue();
            Double usedDays = calculateUsedLeaveDays(employeeId, leaveType);
            Double remainingDays = total - usedDays;

            result.add(new LeaveBalanceDTO(
                    leaveType,
                    labels.get(leaveType),
                    total,
                    usedDays,
                    Math.max(0, remainingDays)
            ));
        }

        return result;
    }

    @Override
    public LeaveBalanceDTO getEmployeeLeaveBalanceByType(String employeeId, String leaveType) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        // Check gender restrictions
        if ("MATERNITY".equalsIgnoreCase(leaveType) && !"FEMALE".equalsIgnoreCase(employee.getGender())) {
            throw new RuntimeException("Maternity leave is only available for female employees");
        }

        if ("PATERNITY".equalsIgnoreCase(leaveType) && !"MALE".equalsIgnoreCase(employee.getGender())) {
            throw new RuntimeException("Paternity leave is only available for male employees");
        }

        Map<String, Double> totalDays = new HashMap<>();
        Map<String, String> labels = new HashMap<>();

        // Common leaves
        totalDays.put("ANNUAL", 22.0);
        totalDays.put("SICK", 18.0);
        totalDays.put("UNPAID", 15.0);


        // Gender-specific leaves
        if ("FEMALE".equalsIgnoreCase(employee.getGender())) {
            totalDays.put("MATERNITY", 30.0);
        }
        if ("MALE".equalsIgnoreCase(employee.getGender())) {
            totalDays.put("PATERNITY", 3.0);
        }

        // Labels mapping
        labels.put("ANNUAL", "Annual Leave");
        labels.put("SICK", "Sick Leave");
        labels.put("UNPAID", "Unpaid Leave");
        labels.put("MATERNITY", "Maternity Leave");
        labels.put("PATERNITY", "Paternity Leave");

        String leaveTypeUpper = leaveType.toUpperCase();
        Double total = totalDays.getOrDefault(leaveTypeUpper, 0.0);
        Double usedDays = calculateUsedLeaveDays(employeeId, leaveTypeUpper);
        Double remainingDays = total - usedDays;
        String label = labels.getOrDefault(leaveTypeUpper, leaveType);

        return new LeaveBalanceDTO(leaveTypeUpper, label, total, usedDays, Math.max(0, remainingDays));
    }
    @Override
    public double calculateUsedLeaveDays(String employeeId, String leaveType) {
        try {
            // Utilisation correcte du repository injecté
            List<Conge> conges = congeRepository.findByEmployeeIdAndTypeAndStatus(
                    employeeId,
                    leaveType.toUpperCase(),
                    "APPROVED" // ou "APPROUVE" selon votre système
            );

            if (conges == null || conges.isEmpty()) {
                return 0.0;
            }

            return conges.stream()
                    .mapToDouble(this::calculateLeaveDays)
                    .sum();

        } catch (Exception e) {
            System.err.println("Error calculating used leave days: " + e.getMessage());
            return 0.0;
        }
    }

    @Override
    public double calculateRemainingLeaveDays(String employeeId, String leaveType) {
        Map<String, Double> totalDays = new HashMap<>();
        totalDays.put("ANNUAL", 22.0);
        totalDays.put("SICK", 18.0);
        totalDays.put("MATERNITY", 30.0);
        totalDays.put("PATERNITY", 3.0);
        totalDays.put("UNPAID", 0.0);

        Double total = totalDays.getOrDefault(leaveType.toUpperCase(), 0.0);
        Double usedDays = calculateUsedLeaveDays(employeeId, leaveType);

        return Math.max(0, total - usedDays);
    }

    private double calculateLeaveDays(Conge conge) {
        if (conge.getStartDate() != null && conge.getEndDate() != null) {
            long diffInMillies = Math.abs(conge.getEndDate().getTime() - conge.getStartDate().getTime());
            long diff = TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);
            return diff + 1;
        }
        return 0.0;
    }
        private boolean isValidGender(String gender) {
            return gender != null &&
                    (gender.equals("MALE") || gender.equals("FEMALE") || gender.equals("OTHER"));
        }
    }