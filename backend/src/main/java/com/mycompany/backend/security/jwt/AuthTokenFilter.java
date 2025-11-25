package com.mycompany.backend.security.jwt;

import com.mycompany.backend.services.EmployeeDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmployeeDetailsServiceImpl employeeDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("🔍 Filter - URL: " + request.getRequestURI());
        System.out.println("🔍 Filter - Method: " + request.getMethod());

        try {
            String jwt = parseJwt(request);

            System.out.println("🔐 JWT token extrait: " + (jwt != null ? "PRÉSENT" : "NULL"));

            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                System.out.println("✅ JWT validé pour l'utilisateur: " + username);

                UserDetails userDetails = employeeDetailsService.loadUserByUsername(username);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                System.out.println("🔓 Authentification définie pour: " + username);
                System.out.println("🎯 Autorités: " + userDetails.getAuthorities());
                logger.info("✅ Authentification réussie pour l'utilisateur: {}", username);
            } else {
                if (jwt == null) {
                    System.out.println("❌ Aucun token JWT trouvé");
                    logger.warn("❌ Aucun token JWT trouvé pour: {}", request.getRequestURI());
                } else {
                    System.out.println("❌ Token JWT invalide");
                    logger.warn("❌ Token JWT invalide pour: {}", request.getRequestURI());
                }
            }
        } catch (UsernameNotFoundException e) {
            System.err.println("❌ Utilisateur non trouvé: " + e.getMessage());
            logger.error("❌ Utilisateur non trouvé: {}", e.getMessage());
        } catch (Exception e) {
            System.err.println("🚨 Erreur dans le filtre JWT: " + e.getMessage());
            logger.error("🚨 Erreur d'authentification: {}", e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        System.out.println("📨 Authorization Header: " + (headerAuth != null ? headerAuth.substring(0, Math.min(headerAuth.length(), 50)) + "..." : "NULL"));

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            String token = headerAuth.substring(7);
            System.out.println("✅ Token JWT extrait, longueur: " + token.length());
            return token;
        }

        System.out.println("❌ Pas de token Bearer trouvé");
        return null;
    }
}