//package com.mycompany.backend.config;
//
//import org.springframework.boot.web.servlet.FilterRegistrationBean;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.core.Ordered;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//import org.springframework.web.filter.CorsFilter;
//
//import java.util.Arrays;
//import java.util.Collections;
//
//@Configuration
//public class GlobalCorsConfig {
//
//    @Bean
//    public FilterRegistrationBean<CorsFilter> corsFilter() {
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        CorsConfiguration config = new CorsConfiguration();
//
//        // Autoriser les cookies
//        config.setAllowCredentials(true);
//
//        // Origines autorisées
//        config.setAllowedOriginPatterns(Collections.singletonList("http://localhost:4200"));
//
//        // Méthodes autorisées
//        config.setAllowedMethods(Arrays.asList(
//                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
//        ));
//
//        // Headers autorisés
//        config.setAllowedHeaders(Arrays.asList(
//                "Authorization", "Content-Type", "X-Requested-With",
//                "Accept", "Origin", "Access-Control-Request-Method",
//                "Access-Control-Request-Headers"
//        ));
//
//        // Headers exposés
//        config.setExposedHeaders(Arrays.asList(
//                "Authorization", "Content-Disposition"
//        ));
//
//        // Durée de cache
//        config.setMaxAge(3600L);
//
//        // Appliquer à toutes les URLs
//        source.registerCorsConfiguration("/**", config);
//
//        // Créer le filtre
//        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
//
//        // IMPORTANT : Définir l'ordre le plus haut
//        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
//
//        return bean;
//    }
//}