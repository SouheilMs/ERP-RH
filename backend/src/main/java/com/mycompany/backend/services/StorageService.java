package com.mycompany.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class StorageService {

    // Dossier pour les photos
    private final String photoDir = "C:/Users/gamin/uploads/photos/";

    // Dossier pour les fichiers de formation
    private final String formationDir = "C:/Users/gamin/uploads/formations/";

    // Stocke une photo d'employé
    public String storePhoto(MultipartFile file) {
        return storeFile(file, photoDir);
    }

    // Stocke un fichier de formation
    public String storeFormationFile(MultipartFile file) {
        return storeFile(file, formationDir);
    }

    // Méthode générale pour stocker un fichier
    private String storeFile(MultipartFile file, String dir) {
        try {
            Path uploadPath = Paths.get(dir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            file.transferTo(filePath.toFile());

            // URL accessible depuis le navigateur
            return "http://localhost:8081/uploads/" + (dir.contains("formations") ? "formations/" : "photos/") + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier", e);
        }
    }

}
