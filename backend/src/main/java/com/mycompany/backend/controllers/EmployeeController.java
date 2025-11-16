package com.mycompany.backend.controllers;

import com.mycompany.backend.dto.EmployeeDTO;
import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.entities.formation;
import com.mycompany.backend.repositories.EmployeeRepository;
import com.mycompany.backend.repositories.FormationRepository;
import com.mycompany.backend.services.EmployeeService;
import com.mycompany.backend.services.GridFsService;
import com.mycompany.backend.services.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private StorageService storageService;

    @Autowired
    private GridFsService gridFsService;

    // -------------------- EMPLOYÉ --------------------

    // Liste tous les employés
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    // Récupérer un employé par ID
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable String id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Créer un employé
    @PostMapping("/Add-employee")
    public ResponseEntity<?> registerNewEmployee(@RequestBody @Valid EmployeeDTO employeeDTO,
                                                 final HttpServletRequest request) {
        return employeeService.registerNewEmployee(employeeDTO, request);
    }

    // Mettre à jour un employé
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable String id,
                                                   @RequestBody Employee employeeDetails) {
        Optional<Employee> optionalEmployee = employeeService.getEmployeeById(id);
        if (optionalEmployee.isEmpty()) return ResponseEntity.notFound().build();

        Employee employee = optionalEmployee.get();
        employee.setUsername(employeeDetails.getUsername());
        employee.setEmail(employeeDetails.getEmail());
        employee.setPhone(employeeDetails.getPhone());
        employee.setSalary(employeeDetails.getSalary());
        employee.setStatus(employeeDetails.getStatus());
        employee.setHireDate(employeeDetails.getHireDate());
        employee.setCin(employeeDetails.getCin());
        employee.setCnssNumber(employeeDetails.getCnssNumber());
        employee.setPosition(employeeDetails.getPosition());
        employee.setAddress(employeeDetails.getAddress());
        employee.setCity(employeeDetails.getCity());
        employee.setMatricule(employeeDetails.getMatricule());
        employee.setRib(employeeDetails.getRib());
        employee.setBankName(employeeDetails.getBankName());
        employee.setWorkingDays(employeeDetails.getWorkingDays());
        employee.setActualWorkingDays(employeeDetails.getActualWorkingDays());
        employee.setTransportAllowance(employeeDetails.getTransportAllowance());
        employee.setFamilyAllowance(employeeDetails.getFamilyAllowance());
        employee.setOtherBonuses(employeeDetails.getOtherBonuses());

        Employee updated = employeeService.saveEmployee(employee);

        return ResponseEntity.ok(updated);
    }

    // Supprimer un employé
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok("Employé supprimé avec succès");
    }

    // -------------------- PHOTO --------------------

    // Upload photo
    @PostMapping("/{id}/upload-photo")
    public ResponseEntity<Employee> uploadPhoto(@PathVariable String id,
                                                @RequestParam("file") MultipartFile file) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        try {
            // Supprimer l'ancienne photo si elle existe
            if (employee.getPhotoId() != null) {
                gridFsService.deleteFile(employee.getPhotoId());
            }

            // Stocker la nouvelle photo dans GridFS
            String photoId = employeeService.storeEmployeePhoto(id, file);
            employee.setPhotoId(photoId);

            // Sauvegarder l'employé dans MongoDB pour que tous les binômes voient le changement
            employeeRepository.save(employee);

            return ResponseEntity.ok(employee);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }



    // Get employee photo by employee ID
    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getEmployeePhoto(@PathVariable String id) throws IOException {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        if(emp.getPhotoId() == null) {
            return ResponseEntity.notFound().build();
        }

        GridFsResource file = gridFsService.getFile(emp.getPhotoId());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .body(file.getInputStream().readAllBytes());
    }

    // -------------------- EXPORT / IMPORT --------------------

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportEmployees() throws IOException {
        ByteArrayOutputStream out = employeeService.exportToExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("employees.xlsx").build());
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok().headers(headers).body(out.toByteArray());
    }

    @PostMapping("/import")
    public ResponseEntity<String> importEmployees(@RequestParam("file") MultipartFile file) {
        try {
            employeeService.ImportFromExcel(file);
            return ResponseEntity.ok("Fichier importé avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'import : " + e.getMessage());
        }
    }
// -------------------- FORMATION --------------------
    @PostMapping("/{id}/formations")
    public ResponseEntity<formation> addFormation(
            @PathVariable String id,
            @RequestParam("name") String name,
            @RequestParam("location") String location,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestParam(value = "certificate", required = false) MultipartFile certificate
    ) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        formation f = new formation();
        f.setName(name);
        f.setLocation(location);
        f.setStartDate(LocalDate.parse(startDate));
        f.setEndDate(LocalDate.parse(endDate));
        f.setEmployee(emp);

        if (certificate != null && !certificate.isEmpty()) {
            // Supprimer ancien certificat si déjà existant (optionnel)
            if(f.getCertificateId() != null) {
                gridFsService.deleteFile(f.getCertificateId());
            }

            // Stocker le PDF dans GridFS
            String fileId = employeeService.storeFormationFile(certificate);
            f.setCertificateId(fileId);
        }

        formation savedFormation = formationRepository.save(f);

        // Ajouter la formation à l'employé et sauvegarder
        emp.getFormations().add(savedFormation);
        employeeRepository.save(emp);

        return ResponseEntity.ok(savedFormation);
    }
// Récupérer le certificat de formation (PDF) par ID
    @GetMapping("/formations/certificate/{id}")
    public ResponseEntity<byte[]> getFormationCertificate(@PathVariable String id) throws IOException {
        GridFsResource resource = gridFsService.getFile(id);
        byte[] data = resource.getInputStream().readAllBytes();

        // En-têtes pour afficher dans le navigateur
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(resource.getContentType()));
        headers.setContentLength(data.length);
        headers.setContentDisposition(ContentDisposition.inline().filename(resource.getFilename()).build());

        // En-têtes de sécurité
        headers.set("X-Content-Type-Options", "nosniff");
        headers.set("X-Frame-Options", "SAMEORIGIN");

        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    // Supprimer une formation et son PDF
    @DeleteMapping("/{employeeId}/formations/{formationId}")
    public ResponseEntity<String> deleteFormation(
            @PathVariable String employeeId,
            @PathVariable String formationId) {

        // Vérifier si l'employé existe
        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Employee not found");
        }
        Employee employee = employeeOpt.get();

        // Trouver la formation
        Optional<formation> formationOpt = formationRepository.findById(formationId);
        if (formationOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Formation not found");
        }
        formation f = formationOpt.get();

        // Supprimer le PDF si existant
        if (f.getCertificateId() != null) {
            try {
                gridFsService.deleteFile(f.getCertificateId());
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Supprimer la formation de l'employé
        employee.getFormations().removeIf(form -> form.getId().equals(formationId));
        employeeRepository.save(employee);

        // Supprimer la formation du repository
        formationRepository.deleteById(formationId);

        return ResponseEntity.ok("Formation supprimée avec succès");
    }
    // -------------------- FICHE DE PAIE --------------------
    @GetMapping("/{id}/payslip")
    public ResponseEntity<byte[]> generatePaySlip(@PathVariable String id) {
        try {
            byte[] pdf = employeeService.generatePaySlipPDF(id);

            // En-têtes pour afficher dans le navigateur plutôt que téléchargement
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.inline().filename("fiche_paie_" + id + ".pdf").build());

            // En-têtes de sécurité
            headers.set("X-Content-Type-Options", "nosniff");
            headers.set("X-Frame-Options", "SAMEORIGIN");

            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


}
