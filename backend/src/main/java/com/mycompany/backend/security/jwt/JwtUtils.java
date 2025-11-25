package com.mycompany.backend.security.jwt;

import com.mycompany.backend.services.EmployeeDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${bezkoder.app.jwtSecret}")
    private String jwtSecret;

    @Value("${bezkoder.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        EmployeeDetailsImpl userPrincipal = (EmployeeDetailsImpl) authentication.getPrincipal();

        String token = Jwts.builder()
                .setSubject((userPrincipal.getEmail()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();

        System.out.println("🎫 JWT Token généré pour: " + userPrincipal.getEmail());
        System.out.println("🎫 Token: " + token);
        return token;
    }

    private Key key() {
        try {
            // Vérifier que le secret est correct
            System.out.println("🔑 JWT Secret configuré: " + (jwtSecret != null ? "OUI" : "NON"));
            System.out.println("🔑 JWT Secret length: " + (jwtSecret != null ? jwtSecret.length() : 0));

            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            System.out.println("🔑 Key bytes length: " + keyBytes.length);

            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            System.err.println("❌ Erreur création de la clé JWT: " + e.getMessage());
            throw new RuntimeException("Erreur de configuration JWT", e);
        }
    }

    public String getUserNameFromJwtToken(String token) {
        try {
            String subject = Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();

            System.out.println("✅ JWT Token validé - Subject: " + subject);
            return subject;
        } catch (Exception e) {
            System.err.println("❌ Erreur extraction subject JWT: " + e.getMessage());
            return null;
        }
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(authToken);

            System.out.println("✅ JWT Token validé avec succès");
            return true;
        } catch (MalformedJwtException e) {
            logger.error("❌ JWT token invalide: {}", e.getMessage());
            System.err.println("❌ JWT token invalide: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("❌ JWT token expiré: {}", e.getMessage());
            System.err.println("❌ JWT token expiré: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("❌ JWT token non supporté: {}", e.getMessage());
            System.err.println("❌ JWT token non supporté: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("❌ JWT claims string vide: {}", e.getMessage());
            System.err.println("❌ JWT claims string vide: " + e.getMessage());
        } catch (Exception e) {
            logger.error("❌ Erreur validation JWT: {}", e.getMessage());
            System.err.println("❌ Erreur validation JWT: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }
}