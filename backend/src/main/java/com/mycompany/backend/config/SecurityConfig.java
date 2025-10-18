// package com.mycompany.backend.config;


// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.web.SecurityFilterChain;

// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {

//     // Swagger / OpenAPI accessible sans auth
//     @Bean
//     public SecurityFilterChain swaggerFilterChain(HttpSecurity http) throws Exception {
//         http
//                 .securityMatcher("/swagger-ui/**", "/v3/api-docs/**", "/api/auth/**")
//                 .csrf(csrf -> csrf.disable())
//                 .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
//         return http.build();
//     }

//     // Tous les autres endpoints accessibles sans authentification
//     @Bean
//     public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
//         http
//                 .securityMatcher("/**") // tous les autres endpoints
//                 .csrf(csrf -> csrf.disable())
//                 .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // autorisé pour tous

//         return http.build();
//     }
// }
