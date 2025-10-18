package com.mycompany.backend;

import com.mycompany.backend.entities.*;
import com.mycompany.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {
    @Autowired
    private EmployeeRepository employeRepository;

    @Autowired
    private CongeRepository congeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private DepartmentRepository departementRepository;

    @Autowired
    private TrainingRepository formationRepository;

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Autowired
    private OffreEmploiRepository offreEmploiRepository;

    @Autowired
    private DocumentsRepository documentsRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed roles
        if (roleRepository.findByName(ERole.ROLE_EMPLOYEE).isEmpty()) {
            Role employeeRole = new Role();
            employeeRole.setName(ERole.ROLE_EMPLOYEE);
            roleRepository.save(employeeRole);
            System.out.println("Employee role created");
        }

        if (roleRepository.findByName(ERole.ROLE_HR).isEmpty()) {
            Role hrRole = new Role();
            hrRole.setName(ERole.ROLE_HR);
            roleRepository.save(hrRole);
            System.out.println("HR role created");
        }

        if (roleRepository.findByName(ERole.ROLE_HRMANAGER).isEmpty()) {
            Role hrManagerRole = new Role();
            hrManagerRole.setName(ERole.ROLE_HRMANAGER);
            roleRepository.save(hrManagerRole);
            System.out.println("HR Manager role created");
        }
        Employee emp = new Employee();
        emp.setUsername("souheil moussa");
        emp.setEmail("moussa@gmail.com");
        employeRepository.save(emp);
        System.out.println("Collection created");
        Notification n = new Notification();
        n.setMessage("Welcome to the system!");
        notificationRepository.save(n);
        System.out.println("Notification created");
        Department d = new Department();
        d.setName("Informatique");
        departementRepository.save(d);
        System.out.println("Departement created");
        Conge c = new Conge();
        c.setType("Annual Leave");
        congeRepository.save(c);
        System.out.println("Conge created");
        Training t = new Training();
        t.setTitle("Java Basics");
        formationRepository.save(t);
        System.out.println("Formation created");
        Candidature cand = new Candidature();
        cand.setCandidateName("John Doe");
        cand.setEmail("john.doe@gmail.com");
        candidatureRepository.save(cand);
        System.out.println("Candidature created");
        JobOffer offer = new JobOffer();
        offer.setTitle("Software Engineer");
        offer.setDescription("Develop and maintain software applications.");
        offreEmploiRepository.save(offer);
        System.out.println("OffreEmploi created");
        Documents doc = new Documents();
        doc.setTitle("Project Plan");
        doc.setType("PDF");
        documentsRepository.save(doc);
        System.out.println("Document created");


    }
}
