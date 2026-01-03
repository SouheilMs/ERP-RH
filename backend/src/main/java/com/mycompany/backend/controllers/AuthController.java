package com.mycompany.backend.controllers;

import com.mycompany.backend.payload.request.LoginRequest;
import com.mycompany.backend.payload.request.SignupRequest;
import com.mycompany.backend.entities.Employee;
import com.mycompany.backend.entities.Role;
import com.mycompany.backend.repositories.EmployeeRepository;
import com.mycompany.backend.repositories.RoleRepository;
import com.mycompany.backend.security.jwt.JwtUtils;
import com.mycompany.backend.services.EmployeeDetailsImpl;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    EmployeeRepository employeeRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    // Afficher la page de login
    @GetMapping("/login")
    public String showLoginPage(Model model) {
        model.addAttribute("loginRequest", new LoginRequest());
        return "auth/login";
    }

    // Removed custom POST /login handler. Spring Security will handle authentication and redirection.

    // Afficher la page d'inscription
    @GetMapping("/signup")
    public String showSignupPage(Model model) {
        model.addAttribute("signupRequest", new SignupRequest());
        return "auth/signup";
    }

    // Traiter l'inscription
    @PostMapping("/signup")
    public String registerUser(@Valid @ModelAttribute SignupRequest signupRequest,
                               BindingResult bindingResult,
                               @RequestParam("role") String role,
                               Model model,
                               RedirectAttributes redirectAttributes) {

        if (bindingResult.hasErrors()) {
            return "auth/signup";
        }

        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            bindingResult.rejectValue("confirmPassword", "error.signupRequest", "Passwords do not match");
            return "auth/signup";
        }

        try {
            if (employeeRepository.existsByUsername(signupRequest.getUsername())) {
                model.addAttribute("errorMessage", "Error: Username is already taken!");
                return "auth/signup";
            }

            if (employeeRepository.existsByEmail(signupRequest.getEmail())) {
                model.addAttribute("errorMessage", "Error: Email is already in use!");
                return "auth/signup";
            }

            Employee employee = new Employee();
            employee.setUsername(signupRequest.getUsername());
            employee.setEmail(signupRequest.getEmail());
            employee.setPassword(encoder.encode(signupRequest.getPassword()));

            Set<Role> roles = new HashSet<>();

            switch (role) {
                case "ROLE_HRMANAGER":
                    Role adminRole = roleRepository.findByRoleName("ROLE_HRMANAGER")
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(adminRole);
                    break;
                case "ROLE_HR":
                    Role hrRole = roleRepository.findByRoleName("ROLE_HR")
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(hrRole);
                    break;
                default:
                    Role employeeRole = roleRepository.findByRoleName("ROLE_EMPLOYEE")
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(employeeRole);
            }

            employee.setRoles(roles);
            employeeRepository.save(employee);

            redirectAttributes.addFlashAttribute("successMessage", "Account created successfully! Please login.");
            return "redirect:/auth/login";

        } catch (Exception e) {
            model.addAttribute("errorMessage", "Error: Registration failed - " + e.getMessage());
            return "auth/signup";
        }
    }

    // Logout
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        SecurityContextHolder.clearContext();
        return "redirect:/auth/login";
    }

    // Page d'accueil par défaut
    @GetMapping("/")
    public String home() {
        return "redirect:/auth/login";
    }
}