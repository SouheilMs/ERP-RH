package com.mycompany.backend.controllers;

import com.mycompany.backend.dto.RoleDTO;
import com.mycompany.backend.dto.RoleResponseDTO;
import com.mycompany.backend.entities.Role;
import com.mycompany.backend.services.RoleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    // CREATE - Créer un nouveau rôle
    @PostMapping
    public ResponseEntity<?> createRole(@Valid @RequestBody RoleDTO roleDTO) {
        try {
            System.out.println(" POST /api/roles - Création d'un nouveau rôle: " + roleDTO.getRoleName());
            Role createdRole = roleService.createRole(roleDTO.getRoleName());
            RoleResponseDTO response = RoleResponseDTO.fromRole(createdRole);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println(" Erreur création rôle: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // READ - Récupérer tous les rôles
    @GetMapping
    public ResponseEntity<List<RoleResponseDTO>> getAllRoles() {
        try {
            System.out.println(" GET /api/roles - Récupération de tous les rôles");
            List<Role> roles = roleService.getAllRoles();
            List<RoleResponseDTO> response = roles.stream()
                    .map(RoleResponseDTO::fromRole)
                    .collect(Collectors.toList());
            System.out.println(" Rôles trouvés: " + roles.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println(" Erreur récupération rôles: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // READ - Récupérer un rôle par ID
    @GetMapping("/{id}")
    public ResponseEntity<RoleResponseDTO> getRoleById(@PathVariable String id) {
        System.out.println(" GET /api/roles/" + id);
        return roleService.getRoleById(id)
                .map(RoleResponseDTO::fromRole)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // READ - Récupérer un rôle par nom
    @GetMapping("/name/{roleName}")
    public ResponseEntity<RoleResponseDTO> getRoleByName(@PathVariable String roleName) {
        System.out.println(" GET /api/roles/name/" + roleName);
        return roleService.getRoleByName(roleName)
                .map(RoleResponseDTO::fromRole)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // READ - Vérifier si un rôle existe
    @GetMapping("/exists/{roleName}")
    public ResponseEntity<Boolean> roleExists(@PathVariable String roleName) {
        System.out.println(" GET /api/roles/exists/" + roleName);
        boolean exists = roleService.existsByName(roleName);
        return ResponseEntity.ok(exists);
    }

    // UPDATE - Mettre à jour un rôle
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRole(@PathVariable String id, @Valid @RequestBody RoleDTO roleDTO) {
        try {
            System.out.println(" PUT /api/roles/" + id + " - Nouveau nom: " + roleDTO.getRoleName());
            Role updatedRole = roleService.updateRole(id, roleDTO.getRoleName());
            RoleResponseDTO response = RoleResponseDTO.fromRole(updatedRole);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println(" Erreur mise à jour rôle: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE - Supprimer un rôle par ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRole(@PathVariable String id) {
        try {
            System.out.println(" DELETE /api/roles/" + id);
            roleService.deleteRole(id);
            return ResponseEntity.ok("Rôle supprimé avec succès");
        } catch (RuntimeException e) {
            System.err.println(" Erreur suppression rôle: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE - Supprimer tous les rôles
    @DeleteMapping
    public ResponseEntity<String> deleteAllRoles() {
        System.out.println("DELETE /api/roles - Suppression de tous les rôles");
        roleService.deleteAllRoles();
        return ResponseEntity.ok("Tous les rôles ont été supprimés avec succès");
    }
}