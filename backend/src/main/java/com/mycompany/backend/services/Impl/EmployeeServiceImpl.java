package com.mycompany.backend.services.Impl;

import com.mycompany.backend.dto.EmployeeDTO;
import com.mycompany.backend.dto.LeaveBalanceDTO;
import com.mycompany.backend.entities.*;
import com.mycompany.backend.repositories.*;
import com.mycompany.backend.services.EmailService;
import com.mycompany.backend.services.EmployeeService;
import com.mycompany.backend.services.GridFsService;
import com.mycompany.backend.services.SalaryCalculationService;

import jakarta.servlet.http.HttpServletRequest;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CongeRepository congeRepository;

    @Autowired
    private PayslipRepository payslipRepository;

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

    @Autowired
    private SalaryCalculationService salaryCalculationService;

    // MÉTHODES DE VÉRIFICATION DES PERMISSIONS - CORRIGÉES
    private boolean hasHRRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("❌ hasHRRole: No authentication or not authenticated");
            return false;
        }

        boolean isHR = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority ->
                        grantedAuthority.getAuthority().equals("ROLE_HR") ||
                                grantedAuthority.getAuthority().equals("ROLE_HRMANAGER"));

        System.out.println("🔍 hasHRRole check: " + isHR);
        System.out.println("🎯 Authorities: " + authentication.getAuthorities());
        return isHR;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("❌ getCurrentUsername: No authentication or not authenticated");
            return null;
        }
        String username = authentication.getName();
        System.out.println("🔍 getCurrentUsername returning: " + username);
        return username;
    }

    // CORRECTION : Méthode pour obtenir l'email de l'utilisateur connecté
    private String getCurrentUserEmail() {
        String currentUsername = getCurrentUsername();
        if (currentUsername == null) {
            return null;
        }

        // Rechercher l'employé par username pour obtenir son email
        Optional<Employee> currentEmployee = employeeRepository.findByUsername(currentUsername);
        if (currentEmployee.isPresent()) {
            String email = currentEmployee.get().getEmail();
            System.out.println("🔍 getCurrentUserEmail: " + email);
            return email;
        }

        // Fallback: si pas trouvé par username, essayer par email
        Optional<Employee> currentEmployeeByEmail = employeeRepository.findByEmail(currentUsername);
        if (currentEmployeeByEmail.isPresent()) {
            String email = currentEmployeeByEmail.get().getEmail();
            System.out.println("🔍 getCurrentUserEmail (fallback): " + email);
            return email;
        }

        System.out.println("❌ getCurrentUserEmail: Employee not found for username: " + currentUsername);
        return null;
    }

    // CORRECTION : Méthode améliorée pour vérifier si c'est son propre profil
    private boolean isViewingOwnProfile(String employeeId) {
        String currentUserEmail = getCurrentUserEmail();
        if (currentUserEmail == null) {
            System.out.println("❌ isViewingOwnProfile: Current user email is null");
            return false;
        }

        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            boolean isOwnProfile = employee.getEmail().equals(currentUserEmail);

            System.out.println("🔍 isViewingOwnProfile DETAILED CHECK:");
            System.out.println("   - Employee ID: " + employeeId);
            System.out.println("   - Employee email: " + employee.getEmail());
            System.out.println("   - Current user email: " + currentUserEmail);
            System.out.println("   - Result: " + isOwnProfile);

            return isOwnProfile;
        }

        System.out.println("❌ isViewingOwnProfile: Employee not found with ID: " + employeeId);
        return false;
    }

    private void checkHRPermission() {
        if (!hasHRRole()) {
            throw new AccessDeniedException("Access denied: HR role required");
        }
    }

    // CORRECTION : Méthode améliorée pour vérifier l'accès au profil
    private void checkEmployeeProfileAccess(String employeeId) {
        System.out.println("=== VÉRIFICATION PERMISSION ACCÈS PROFIL EMPLOYÉ ===");
        System.out.println("Employee ID demandé: " + employeeId);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            System.out.println("👤 Utilisateur authentifié: " + authentication.getName());
            System.out.println("🎯 Authorities: " + authentication.getAuthorities());
            System.out.println("🔐 Principal: " + authentication.getPrincipal());
            System.out.println("✅ Is authenticated: " + authentication.isAuthenticated());
        } else {
            System.out.println("❌ Aucune authentification trouvée!");
            throw new AccessDeniedException("Non authentifié");
        }

        boolean isHR = hasHRRole();
        boolean isOwnProfile = isViewingOwnProfile(employeeId);

        System.out.println("👑 Est HR ou RH Manager: " + isHR);
        System.out.println("👤 Est son propre profil: " + isOwnProfile);

        // LOGIQUE : Autoriser si c'est son propre profil OU si c'est un RH
        if (!isHR && !isOwnProfile) {
            System.out.println("❌ ACCÈS REFUSÉ: Ni HR ni propre profil");
            throw new AccessDeniedException("Access denied: You can only access your own profile");
        }

        System.out.println("✅ ACCÈS AUTORISÉ AU PROFIL");
        System.out.println("=== FIN VÉRIFICATION ===");
    }

    private void checkPayslipGenerationPermission(String employeeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        System.out.println("=== VÉRIFICATION PERMISSION FICHE DE PAIE ===");
        System.out.println("Employee ID demandé: " + employeeId);

        if (authentication != null) {
            System.out.println("Utilisateur authentifié: " + authentication.getName());
            System.out.println("Authorities: " + authentication.getAuthorities());
        } else {
            System.out.println("❌ Aucune authentification trouvée!");
        }

        boolean isHR = hasHRRole();
        boolean isOwnProfile = isViewingOwnProfile(employeeId);

        System.out.println("Est HR: " + isHR);
        System.out.println("Est son propre profil: " + isOwnProfile);

        if (!isHR && !isOwnProfile) {
            System.out.println("❌ ACCÈS REFUSÉ: Ni HR ni propre profil");
            throw new AccessDeniedException("Access denied: You can only generate your own payslips");
        }

        System.out.println("✅ ACCÈS AUTORISÉ");
        System.out.println("=== FIN VÉRIFICATION ===");
    }

    private void checkFormationPermission(String employeeId) {
        if (!hasHRRole() && !isViewingOwnProfile(employeeId)) {
            throw new AccessDeniedException("Access denied: You can only manage your own formations");
        }
    }

    @Override
    public List<Employee> getAllEmployees() {
        // SEULS LES RH PEUVENT VOIR TOUS LES EMPLOYÉS
        checkHRPermission();
        return employeeRepository.findAll();
    }

    @Override
    public Optional<Employee> getEmployeeById(String id) {
        System.out.println("🔄 EmployeeServiceImpl.getEmployeeById called for ID: " + id);

        // NOUVELLE VÉRIFICATION : Autoriser l'accès si c'est son propre profil ou si c'est un RH
        checkEmployeeProfileAccess(id);

        Optional<Employee> employee = employeeRepository.findById(id);
        if (employee.isPresent()) {
            System.out.println("✅ Employee found: " + employee.get().getUsername());
        } else {
            System.out.println("❌ Employee not found with ID: " + id);
        }
        return employee;
    }

    @Override
    public void deleteEmployee(String id) {
        // SEULS LES RH PEUVENT SUPPRIMER
        checkHRPermission();
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
        // SEULS LES RH PEUVENT CRÉER DES EMPLOYÉS
        checkHRPermission();

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
                return ResponseEntity.badRequest().body("Invalid gender value. Use: MALE, FEMALE");
            }
        }

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


        Map<String, Object> seniorityInfo = salaryCalculationService.calculateSeniorityBonus(employee);
        employee.setYearsOfService((Integer) seniorityInfo.get("yearsOfService"));
        employee.setMonthsOfService((Integer) seniorityInfo.get("monthsOfService"));
        employee.setBonusPeriods((Integer) seniorityInfo.get("bonusPeriods"));
        employee.setTraditionalSeniorityBonus((Double) seniorityInfo.get("traditionalSeniorityBonus"));
        employee.setNineDinarsBonus((Double) seniorityInfo.get("nineDinarsBonus"));
        employee.setSeniorityBonus((Double) seniorityInfo.get("seniorityBonus"));

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
        Map<String, Object> successResponse = new HashMap<>();
        successResponse.put("message", "Employee created successfully");
        successResponse.put("employeeId", savedEmployee.getId());
        successResponse.put("username", savedEmployee.getUsername());
        successResponse.put("email", savedEmployee.getEmail());

        return ResponseEntity.ok("Employee registered successfully!");
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf((int) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }

    @Override
    public void ImportFromExcel(MultipartFile file) throws IOException {
        // SEULS LES RH PEUVENT IMPORTER
        checkHRPermission();

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

    @Override
    public ByteArrayOutputStream exportToExcel() throws IOException {
        // SEULS LES RH PEUVENT EXPORTER
        checkHRPermission();

        List<Employee> employees = employeeRepository.findAll();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Employees");

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row header = sheet.createRow(0);
        String[] headers = {"ID", "Email", "Nom", "Téléphone", "Salaire", "Poste", "CIN", "CNSS", "Date d'embauche"};

        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

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
            row.createCell(8).setCellValue(emp.getHireDate() != null ? emp.getHireDate().toString() : "");
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out;
    }

    @Override
    public String storeEmployeePhoto(String id, MultipartFile file) {
        // SEULS LES RH PEUVENT UPLOADER DES PHOTOS
        checkHRPermission();

        try {
            Optional<Employee> employeeOpt = employeeRepository.findById(id);
            if (employeeOpt.isEmpty()) {
                throw new RuntimeException("Employee not found with id: " + id);
            }

            String fileId = gridFsService.saveFile(file);

            Employee employee = employeeOpt.get();
            employee.setPhotoId(fileId);
            employeeRepository.save(employee);

            return fileId;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de la photo", e);
        }
    }

    @Override
    public String storeFormationFile(MultipartFile file) {
        try {
            return gridFsService.saveFile(file);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier formation", e);
        }
    }

    @Override
    public byte[] generatePaySlipPDF(String employeeId) throws IOException {
        try {
            checkPayslipGenerationPermission(employeeId);

            Employee emp = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

            Calendar cal = Calendar.getInstance();
            int month = cal.get(Calendar.MONTH) + 1;
            int year = cal.get(Calendar.YEAR);

            return generatePaySlipPDF(employeeId, month, year);

        } catch (Exception e) {
            System.err.println("Erreur génération fiche: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la génération de la fiche de paie: " + e.getMessage());
        }
    }

    @Override
    public byte[] generatePaySlipPDF(String employeeId, Integer month, Integer year) throws IOException {
        checkPayslipGenerationPermission(employeeId);

        try {
            Employee emp = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

            if (month == null || year == null) {
                Calendar cal = Calendar.getInstance();
                month = cal.get(Calendar.MONTH) + 1;
                year = cal.get(Calendar.YEAR);
            }

            Map<String, Object> seniorityInfo = salaryCalculationService.calculateSeniorityBonus(emp);

            if (seniorityInfo.get("seniorityBonus") == null) {
                seniorityInfo.put("seniorityBonus", 0.0);
            }

            Map<String, Object> salaryInfo = salaryCalculationService.calculateCompleteSalary(emp, seniorityInfo);

            Double netSalary = salaryInfo.get("netSalary") != null ? (Double) salaryInfo.get("netSalary") : 0.0;
            Double totalBrut = salaryInfo.get("totalBrut") != null ? (Double) salaryInfo.get("totalBrut") : 0.0;

            int yearsOfService = seniorityInfo.get("yearsOfService") != null ? (int) seniorityInfo.get("yearsOfService") : 0;
            int monthsOfService = seniorityInfo.get("monthsOfService") != null ? (int) seniorityInfo.get("monthsOfService") : 0;
            int bonusPeriods = seniorityInfo.get("bonusPeriods") != null ? (int) seniorityInfo.get("bonusPeriods") : 0;
            double traditionalSeniorityBonus = seniorityInfo.get("traditionalSeniorityBonus") != null ? (double) seniorityInfo.get("traditionalSeniorityBonus") : 0.0;
            double nineDinarsBonus = seniorityInfo.get("nineDinarsBonus") != null ? (double) seniorityInfo.get("nineDinarsBonus") : 0.0;
            double totalSeniorityBonus = seniorityInfo.get("seniorityBonus") != null ? (double) seniorityInfo.get("seniorityBonus") : 0.0;

            emp.setYearsOfService(yearsOfService);
            emp.setMonthsOfService(monthsOfService);
            emp.setBonusPeriods(bonusPeriods);
            emp.setTraditionalSeniorityBonus(traditionalSeniorityBonus);
            emp.setNineDinarsBonus(nineDinarsBonus);
            emp.setSeniorityBonus(totalSeniorityBonus);
            employeeRepository.save(emp);

            String[] monthNames = {"Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"};
            String period = monthNames[month - 1] + " " + year;

            Optional<Payslip> existingPayslip = payslipRepository
                    .findByEmployeeIdAndYearAndMonth(employeeId, year, month);

            Payslip payslip;
            if (existingPayslip.isPresent()) {
                payslip = existingPayslip.get();
                payslip.setNetSalary(netSalary);
                payslip.setGrossSalary(totalBrut);
                payslip.setSeniorityBonus(totalSeniorityBonus);
                payslip.setYearsOfService(yearsOfService);
                payslip.setMonthsOfService(monthsOfService);
                payslip.setBonusPeriods(bonusPeriods);
                payslip.setPeriod(period);
                payslip.setGenerationDate(new Date());
            } else {
                payslip = new Payslip();
                payslip.setEmployee(emp);
                payslip.setPeriod(period);
                payslip.setMonth(month);
                payslip.setYear(year);
                payslip.setNetSalary(netSalary);
                payslip.setGrossSalary(totalBrut);
                payslip.setSeniorityBonus(totalSeniorityBonus);
                payslip.setYearsOfService(yearsOfService);
                payslip.setMonthsOfService(monthsOfService);
                payslip.setBonusPeriods(bonusPeriods);
                payslip.setGenerationDate(new Date());
            }

            Payslip savedPayslip = payslipRepository.save(payslip);
            System.out.println("Fiche sauvegardée: " + savedPayslip.getId());

            String pdfContent = "FICHE DE PAIE - " + period + "\n" +
                    "Employé: " + emp.getUsername() + "\n" +
                    "Salaire net: " + netSalary + " TND\n" +
                    "Salaire brut: " + totalBrut + " TND\n" +
                    "Prime ancienneté: " + totalSeniorityBonus + " TND\n" +
                    "Prime 9 dinars: " + nineDinarsBonus + " TND";

            return pdfContent.getBytes();

        } catch (Exception e) {
            System.err.println("Erreur génération fiche: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la génération de la fiche de paie: " + e.getMessage());
        }
    }

    @Override
    public Optional<Payslip> getLatestPayslip(String employeeId, Integer year, Integer month) {
        try {
            System.out.println("Recherche dernière fiche pour employé: " + employeeId);

            if (year != null && month != null) {
                System.out.println("Recherche fiche spécifique: " + month + "/" + year);
                Optional<Payslip> payslip = payslipRepository.findByEmployeeIdAndYearAndMonth(employeeId, year, month);

                if (payslip.isPresent()) {
                    System.out.println("Fiche spécifique trouvée: " + payslip.get().getPeriod());
                } else {
                    System.out.println("Aucune fiche trouvée pour " + month + "/" + year);
                }

                return payslip;
            } else {
                System.out.println("Recherche dernière fiche créée");
                List<Payslip> payslips = payslipRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId);

                if (payslips.isEmpty()) {
                    System.out.println("Aucune fiche existante pour cet employé");
                    return Optional.empty();
                }

                Payslip latest = payslips.get(0);
                System.out.println("Dernière fiche: " + latest.getPeriod() + " (ID: " + latest.getId() + ")");
                return Optional.of(latest);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de la recherche de fiche: " + e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public List<Integer> getAvailableYears(String employeeId) {
        checkEmployeeProfileAccess(employeeId);

        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) return Collections.emptyList();

        Employee employee = employeeOpt.get();

        System.out.println("CALCUL DES ANNÉES DISPONIBLES");
        System.out.println("Employé: " + employee.getUsername());
        System.out.println("Date d'embauche: " + employee.getHireDate());

        List<Integer> yearsFromPayslips = payslipRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId)
                .stream()
                .map(Payslip::getYear)
                .filter(Objects::nonNull)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        System.out.println("Années depuis les fiches existantes: " + yearsFromPayslips);

        List<Integer> yearsFromHireDate = this.generateAllYearsSinceHireDate(employee);
        System.out.println("Toutes les années depuis l'embauche: " + yearsFromHireDate);

        Set<Integer> allYears = new TreeSet<>(Comparator.reverseOrder());
        allYears.addAll(yearsFromHireDate);
        allYears.addAll(yearsFromPayslips);

        List<Integer> finalYears = new ArrayList<>(allYears);
        System.out.println("Années finales disponibles: " + finalYears);
        System.out.println("FIN CALCUL ANNÉES");

        return finalYears;
    }

    private List<Integer> generateAllYearsSinceHireDate(Employee employee) {
        List<Integer> years = new ArrayList<>();

        if (employee.getHireDate() == null) {
            System.out.println("Pas de date d'embauche, utilisation de l'année courante");
            int currentYear = Calendar.getInstance().get(Calendar.YEAR);
            years.add(currentYear);
            return years;
        }

        Calendar hireDate = Calendar.getInstance();
        hireDate.setTime(employee.getHireDate());
        int hireYear = hireDate.get(Calendar.YEAR);

        Calendar currentDate = Calendar.getInstance();
        int currentYear = currentDate.get(Calendar.YEAR);

        System.out.println("Période de travail: " + hireYear + " à " + currentYear);

        for (int year = hireYear; year <= currentYear; year++) {
            years.add(year);
        }

        System.out.println("Années de travail générées: " + years);
        return years;
    }

    @Override
    public boolean isMonthAvailableForEmployee(Employee employee, int year, int month) {
        if (employee.getHireDate() == null) {
            System.out.println("Pas de date d'embauche - mois disponible");
            return true;
        }

        Calendar hireDate = Calendar.getInstance();
        hireDate.setTime(employee.getHireDate());
        int hireYear = hireDate.get(Calendar.YEAR);
        int hireMonth = hireDate.get(Calendar.MONTH) + 1;

        System.out.println("Vérification mois " + month + "/" + year +
                " vs embauche " + hireMonth + "/" + hireYear);

        boolean isAvailable = (year > hireYear) || (year == hireYear && month >= hireMonth);

        System.out.println("Résultat: " + (isAvailable ? "DISPONIBLE" : "NON DISPONIBLE"));

        return isAvailable;
    }

    @Override
    public List<Payslip> getEmployeePayslipsByYear(String employeeId, int year) {
        checkEmployeeProfileAccess(employeeId);

        try {
            if (!employeeRepository.existsById(employeeId)) {
                System.err.println("Employé non trouvé: " + employeeId);
                return Collections.emptyList();
            }

            System.out.println("Recherche fiches pour employé: " + employeeId + ", année: " + year);

            List<Payslip> payslips = payslipRepository.findByEmployeeIdAndYearOrderByMonthDesc(employeeId, year);

            if (payslips.isEmpty()) {
                System.out.println("Tentative avec méthode alternative...");
                payslips = payslipRepository.findByEmployeeIdAndYearRobust(employeeId, year);
            }

            if (payslips.isEmpty()) {
                System.out.println("Fallback final - Filtrage côté serveur...");
                List<Payslip> allPayslips = payslipRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId);
                payslips = allPayslips.stream()
                        .filter(p -> p.getYear() == year)
                        .collect(Collectors.toList());
            }

            System.out.println("Fiches trouvées: " + payslips.size());
            return payslips;

        } catch (Exception e) {
            System.err.println("Erreur récupération fiches: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<Payslip> getEmployeePayslips(String employeeId) {
        checkEmployeeProfileAccess(employeeId);

        try {
            if (!employeeRepository.existsById(employeeId)) {
                System.err.println("Employé non trouvé: " + employeeId);
                return Collections.emptyList();
            }

            List<Payslip> payslips = payslipRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId);
            System.out.println("Fiches récupérées pour " + employeeId + ": " + payslips.size());
            return payslips;
        } catch (Exception e) {
            System.err.println("Erreur récupération toutes les fiches: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public boolean isMonthInFuture(int year, int month) {
        Calendar currentDate = Calendar.getInstance();
        int currentYear = currentDate.get(Calendar.YEAR);
        int currentMonth = currentDate.get(Calendar.MONTH) + 1;

        System.out.println("Vérification mois " + month + "/" + year +
                " vs actuel " + currentMonth + "/" + currentYear);

        if (year > currentYear) {
            System.out.println(month + "/" + year + " est dans le futur (année future)");
            return true;
        }

        if (year == currentYear && month > currentMonth) {
            System.out.println(month + "/" + year + " est dans le futur (mois futur)");
            return true;
        }

        System.out.println(month + "/" + year + " peut être généré");
        return false;
    }

    @Override
    public Payslip savePayslip(Payslip payslip) {
        if (payslip.getEmployee() == null) {
            throw new RuntimeException("Payslip must have an employee");
        }
        if (payslip.getMonth() == null || payslip.getYear() == null) {
            throw new RuntimeException("Payslip must have month and year");
        }

        return payslipRepository.save(payslip);
    }

    @Override
    public Optional<Payslip> getPayslipById(String payslipId) {
        return payslipRepository.findById(payslipId);
    }

    @Override
    public Map<String, Object> generatePayslipsForYear(String employeeId, int year) {
        checkPayslipGenerationPermission(employeeId);

        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            throw new RuntimeException("Employee not found with id: " + employeeId);
        }

        Employee employee = employeeOpt.get();
        Map<String, Object> result = new HashMap<>();
        List<Payslip> generatedPayslips = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;
        int skippedCount = 0;
        int futureMonthsCount = 0;

        if (year > Calendar.getInstance().get(Calendar.YEAR)) {
            throw new RuntimeException("Impossible de générer des fiches pour une année future: " + year);
        }

        System.out.println("Génération annuelle pour " + year + " - Employé: " + employee.getUsername());

        for (int month = 1; month <= 12; month++) {
            try {
                if (isMonthInFuture(year, month)) {
                    futureMonthsCount++;
                    System.out.println("Mois futur ignoré: " + month + "/" + year);
                    continue;
                }

                if (isMonthAvailableForEmployee(employee, year, month)) {
                    byte[] pdfData = generatePaySlipPDF(employeeId, month, year);
                    successCount++;

                    Optional<Payslip> payslipOpt = payslipRepository
                            .findByEmployeeIdAndYearAndMonth(employeeId, year, month);
                    payslipOpt.ifPresent(generatedPayslips::add);

                    System.out.println("Fiche générée: " + month + "/" + year);
                } else {
                    skippedCount++;
                    System.out.println("Mois non disponible (avant embauche): " + month + "/" + year);
                }
            } catch (Exception e) {
                errorCount++;
                System.err.println("Erreur génération fiche " + month + "/" + year + ": " + e.getMessage());
            }
        }

        result.put("generatedCount", successCount);
        result.put("errorCount", errorCount);
        result.put("skippedCount", skippedCount);
        result.put("futureMonthsCount", futureMonthsCount);
        result.put("payslips", generatedPayslips);

        String message = "Génération terminée: " + successCount + " succès, " +
                errorCount + " erreurs, " + skippedCount + " mois non disponibles";

        if (futureMonthsCount > 0) {
            message += ", " + futureMonthsCount + " mois futurs ignorés";
        }

        result.put("message", message);

        return result;
    }

    @Override
    public Map<String, Object> generateTestPayslips(String employeeId) {
        checkPayslipGenerationPermission(employeeId);

        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            throw new RuntimeException("Employee not found with id: " + employeeId);
        }

        Employee employee = employeeOpt.get();
        Map<String, Object> result = new HashMap<>();
        List<Payslip> generatedPayslips = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;
        int futureMonthsCount = 0;

        int currentYear = Calendar.getInstance().get(Calendar.YEAR);

        int[] testMonths = {10, 11, 12};

        System.out.println("Génération fiches de test pour " + employee.getUsername());

        for (int month : testMonths) {
            try {
                if (isMonthInFuture(currentYear, month)) {
                    futureMonthsCount++;
                    System.out.println("Mois futur ignoré: " + month + "/" + currentYear);
                    continue;
                }

                if (isMonthAvailableForEmployee(employee, currentYear, month)) {
                    byte[] pdfData = generatePaySlipPDF(employeeId, month, currentYear);
                    successCount++;

                    Optional<Payslip> payslipOpt = payslipRepository
                            .findByEmployeeIdAndYearAndMonth(employeeId, currentYear, month);
                    payslipOpt.ifPresent(generatedPayslips::add);

                    System.out.println("Fiche test générée: " + month + "/" + currentYear);
                } else {
                    System.out.println("Mois test non disponible: " + month + "/" + currentYear);
                }
            } catch (Exception e) {
                errorCount++;
                System.err.println("Erreur génération fiche test " + month + "/" + currentYear + ": " + e.getMessage());
            }
        }

        result.put("count", successCount);
        result.put("errorCount", errorCount);
        result.put("futureMonthsCount", futureMonthsCount);
        result.put("payslips", generatedPayslips);

        String message = "Génération test terminée: " + successCount + " fiches créées";
        if (futureMonthsCount > 0) {
            message += ", " + futureMonthsCount + " mois futurs ignorés";
        }
        if (errorCount > 0) {
            message += ", " + errorCount + " erreurs";
        }

        result.put("message", message);

        return result;
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
                    (gender.equals("MALE") || gender.equals("FEMALE"));
        }
    }