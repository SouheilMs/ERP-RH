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
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                
                logger.info(" Token JWT valide pour l'utilisateur: {}", username);
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    try {
                        // UTILISER UNIQUEMENT loadUserByUsername
                        UserDetails userDetails = employeeDetailsService.loadUserByUsername(username);
                        
                        logger.info(" UserDetails chargé - Username: {}", userDetails.getUsername());
                        logger.info(" Authorities: {}", userDetails.getAuthorities());
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.info(" Authentification configurée dans SecurityContext pour: {}", username);
                    } catch (UsernameNotFoundException e) {
                        logger.error(" Utilisateur non trouvé avec username: {}", username);
                    }
                }
            } else {
                logger.warn(" Token JWT invalide ou manquant");
            }
        } catch (Exception e) {
            logger.error(" Erreur lors de l'authentification JWT: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            String token = headerAuth.substring(7);
            logger.debug(" Token JWT extrait, longueur: {}", token.length());
            return token;
        }

        logger.debug(" Pas de token Bearer trouvé");
        return null;
    }
}