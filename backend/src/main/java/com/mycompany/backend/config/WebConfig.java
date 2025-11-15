package com.mycompany.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Supprime ces lignes, car stockage local empêche la synchronisation
        // registry.addResourceHandler("/uploads/photos/**")
        //         .addResourceLocations("file:C:/Users/gamin/uploads/photos/");
        // registry.addResourceHandler("/uploads/formations/**")
        //         .addResourceLocations("file:C:/Users/gamin/uploads/formations/");
    }

}
