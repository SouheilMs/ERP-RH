package com.mycompany.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Autowired
	private UserDetailsService userDetailsService;

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
		AuthenticationManagerBuilder auth = http.getSharedObject(AuthenticationManagerBuilder.class);
		auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
		return auth.build();
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			.csrf(csrf -> csrf.disable())
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/auth/login", "/auth/signup", "/auth/forgot-password", "/css/**", "/js/**", "/images/**").permitAll()
				.anyRequest().authenticated()
			)
			.formLogin(form -> form
				.loginPage("/auth/login")
				.usernameParameter("email")
				.defaultSuccessUrl("/dashboard", true)
				.failureUrl("/auth/login?error=true")
				.permitAll()
			)
			.logout(logout -> logout
				.logoutUrl("/auth/logout")
				.logoutSuccessUrl("/auth/login?logout=true")
				.permitAll()
			);
		return http.build();
	}
}
