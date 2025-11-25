package com.mycompany.backend.services;

import com.mycompany.backend.dto.LinkedInPostStats;
import com.mycompany.backend.entities.JobOffer;
import com.mycompany.backend.dto.LinkedInPostResponse;

public interface LinkedInService {

    /**
     * Publie une offre d'emploi sur LinkedIn
     */
    LinkedInPostResponse publishJobOffer(JobOffer jobOffer);

    /**
     * Met à jour une publication LinkedIn existante
     */
    LinkedInPostResponse updateJobOfferPost(String postId, JobOffer jobOffer);

    /**
     * Supprime une publication LinkedIn
     */
    void deleteJobOfferPost(String postId);

    /**
     * Récupère les statistiques d'une publication
     */
    LinkedInPostStats getPostStats(String postId);

    /**
     * Teste la connexion à l'API LinkedIn
     */
    boolean testConnection();

    /**
     * Formate le contenu pour LinkedIn
     */
    String formatLinkedInContent(JobOffer jobOffer);
}