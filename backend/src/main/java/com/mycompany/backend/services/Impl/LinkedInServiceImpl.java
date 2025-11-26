package com.mycompany.backend.services.Impl;

import com.mycompany.backend.config.LinkedInConfig;
import com.mycompany.backend.entities.JobOffer;
import com.mycompany.backend.dto.LinkedInPostRequest;
import com.mycompany.backend.dto.LinkedInPostResponse;
import com.mycompany.backend.dto.LinkedInPostStats;
import com.mycompany.backend.exceptions.LinkedInApiException;
import com.mycompany.backend.services.LinkedInService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class LinkedInServiceImpl implements LinkedInService {

    private final RestTemplate restTemplate;
    private final LinkedInConfig linkedInConfig;

    private static final String UGC_POSTS_URL = "/ugcPosts";
    private static final String SHARES_URL = "/shares";
    private static final String ORGANIZATIONAL_ENTITY_URN_PREFIX = "urn:li:organization:";

    public LinkedInServiceImpl(RestTemplate restTemplate, LinkedInConfig linkedInConfig) {
        this.restTemplate = restTemplate;
        this.linkedInConfig = linkedInConfig;
    }

    @Override
    public LinkedInPostResponse publishJobOffer(JobOffer jobOffer) {
        log.info("Publishing job offer to LinkedIn: {}", jobOffer.getTitle());

        try {
            validateConfiguration();
            validateJobOffer(jobOffer);

            String shareText = formatLinkedInContent(jobOffer);
            LinkedInPostRequest request = createPostRequest(shareText);

            HttpEntity<LinkedInPostRequest> entity = createHttpEntity(request);

            ResponseEntity<LinkedInPostResponse> response = restTemplate.postForEntity(
                    linkedInConfig.getApiUrl() + UGC_POSTS_URL,
                    entity,
                    LinkedInPostResponse.class
            );

            if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
                LinkedInPostResponse postResponse = response.getBody();
                postResponse.setSuccess(true);
                log.info("Job offer published successfully on LinkedIn. Post ID: {}", postResponse.getId());
                return postResponse;
            } else {
                throw new LinkedInApiException("Failed to publish job offer. Status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error publishing job offer to LinkedIn: {}", e.getMessage(), e);
            LinkedInPostResponse errorResponse = new LinkedInPostResponse();
            errorResponse.setSuccess(false);
            errorResponse.setErrorMessage(e.getMessage());
            return errorResponse;
        }
    }

    @Override
    public LinkedInPostResponse updateJobOfferPost(String postId, JobOffer jobOffer) {
        log.info("Updating LinkedIn post {} for job offer: {}", postId, jobOffer.getTitle());

        try {
            validateConfiguration();
            validateJobOffer(jobOffer);

            String shareText = formatLinkedInContent(jobOffer);

            // LinkedIn ne permet pas de mettre à jour directement un post UGC
            // On doit créer un nouveau post et archiver l'ancien
            LinkedInPostResponse newPost = publishJobOffer(jobOffer);

            if (newPost.isSuccess()) {
                // Archive l'ancien post
                deleteJobOfferPost(postId);
                log.info("Successfully updated LinkedIn post. New post ID: {}", newPost.getId());
            }

            return newPost;

        } catch (Exception e) {
            log.error("Error updating LinkedIn post: {}", e.getMessage(), e);
            LinkedInPostResponse errorResponse = new LinkedInPostResponse();
            errorResponse.setSuccess(false);
            errorResponse.setErrorMessage(e.getMessage());
            return errorResponse;
        }
    }

    @Override
    public void deleteJobOfferPost(String postId) {
        log.info("Deleting LinkedIn post: {}", postId);

        try {
            validateConfiguration();

            HttpHeaders headers = createHeaders();

            // Pour supprimer un post, on change son lifecycleState à "ARCHIVED"
            Map<String, String> updateRequest = new HashMap<>();
            updateRequest.put("lifecycleState", "ARCHIVED");

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(updateRequest, headers);

            String url = linkedInConfig.getApiUrl() + UGC_POSTS_URL + "/" + postId;

            restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);

            log.info("Successfully archived LinkedIn post: {}", postId);

        } catch (Exception e) {
            log.error("Error deleting LinkedIn post {}: {}", postId, e.getMessage(), e);
            throw new LinkedInApiException("Failed to delete LinkedIn post: " + e.getMessage());
        }
    }

    @Override
    public LinkedInPostStats getPostStats(String postId) {
        log.info("Fetching stats for LinkedIn post: {}", postId);

        try {
            validateConfiguration();

            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // URL pour récupérer les statistiques d'engagement
            String url = UriComponentsBuilder
                    .fromHttpUrl(linkedInConfig.getApiUrl() + "/organizationalEntityShareStatistics")
                    .queryParam("q", "organizationalEntity")
                    .queryParam("organizationalEntity", linkedInConfig.getOrganizationUrn())
                    .queryParam("ugcPostUrns", "urn:li:ugcPost:" + postId)
                    .toUriString();

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            return parseStatsFromResponse(response.getBody(), postId);

        } catch (Exception e) {
            log.error("Error fetching LinkedIn post stats {}: {}", postId, e.getMessage(), e);
            throw new LinkedInApiException("Failed to fetch post statistics: " + e.getMessage());
        }
    }

    @Override
    public boolean testConnection() {
        log.info("Testing LinkedIn API connection");

        try {
            validateConfiguration();

            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = linkedInConfig.getApiUrl() + "/me";

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            boolean connected = response.getStatusCode() == HttpStatus.OK;
            log.info("LinkedIn API connection test: {}", connected ? "SUCCESS" : "FAILED");

            return connected;

        } catch (Exception e) {
            log.error("LinkedIn API connection test failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public String formatLinkedInContent(JobOffer jobOffer) {
        StringBuilder content = new StringBuilder();

        content.append("🎯 Nous recrutons : ").append(jobOffer.getTitle()).append("\n\n");

        content.append("📍 Localisation : ").append(jobOffer.getLocation()).append("\n");
        content.append("📝 Type de contrat : ").append(jobOffer.getContractType()).append("\n");
        content.append("🏢 Département : ").append(jobOffer.getDepartment()).append("\n\n");

        // Description
        String description = jobOffer.getDescription();
        if (description.length() > 250) {
            content.append(description.substring(0, 250)).append("...\n\n");
        } else {
            content.append(description).append("\n\n");
        }

        // Responsabilités
        String responsibilities = jobOffer.getResponsibilities();
        if (responsibilities.length() > 150) {
            content.append("📋 ").append(responsibilities.substring(0, 150)).append("...\n\n");
        } else if (!responsibilities.isEmpty()) {
            content.append("📋 ").append(responsibilities).append("\n\n");
        }

        // Exigences
        String requirements = jobOffer.getRequirements();
        if (requirements.length() > 150) {
            content.append("🎯 ").append(requirements.substring(0, 150)).append("...\n\n");
        } else if (!requirements.isEmpty()) {
            content.append("🎯 ").append(requirements).append("\n\n");
        }

        // Date de clôture
        if (jobOffer.getClosingDate() != null) {
            content.append("📅 Date de clôture : ")
                    .append(jobOffer.getClosingDate().toString()).append("\n\n");
        }

        content.append("👉 Postulez maintenant !\n\n");

        // Hashtags
        content.append(generateHashtags(jobOffer));

        return content.toString();
    }

    // Méthodes privées utilitaires
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(linkedInConfig.getAccessToken());
        headers.set("X-Restli-Protocol-Version", "2.0.0");
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
        return headers;
    }

    private HttpEntity<LinkedInPostRequest> createHttpEntity(LinkedInPostRequest request) {
        return new HttpEntity<>(request, createHeaders());
    }

    private LinkedInPostRequest createPostRequest(String shareText) {
        return new LinkedInPostRequest(
                linkedInConfig.getOrganizationUrn(),
                "PUBLISHED",
                shareText,
                "PUBLIC"
        );
    }

    private void validateConfiguration() {
        if (linkedInConfig.getAccessToken() == null || linkedInConfig.getAccessToken().isEmpty()) {
            throw new LinkedInApiException("LinkedIn access token is not configured");
        }
        if (linkedInConfig.getOrganizationId() == null || linkedInConfig.getOrganizationId().isEmpty()) {
            throw new LinkedInApiException("LinkedIn organization ID is not configured");
        }
    }

    private void validateJobOffer(JobOffer jobOffer) {
        if (jobOffer == null) {
            throw new IllegalArgumentException("Job offer cannot be null");
        }
        if (jobOffer.getTitle() == null || jobOffer.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Job offer title is required");
        }
        if (jobOffer.getDescription() == null || jobOffer.getDescription().isEmpty()) {
            throw new IllegalArgumentException("Job offer description is required");
        }
    }

    private String generateHashtags(JobOffer jobOffer) {
        StringBuilder hashtags = new StringBuilder();

        hashtags.append("#recrutement #emploi #offredemploi");

        if (jobOffer.getDepartment() != null) {
            String departmentTag = jobOffer.getDepartment()
                    .replace(" ", "")
                    .replace("&", "et");
            hashtags.append(" #").append(departmentTag);
        }

        if (jobOffer.getContractType() != null) {
            String contractTag = jobOffer.getContractType()
                    .replace(" ", "")
                    .toLowerCase();
            hashtags.append(" #").append(contractTag);
        }

        if (jobOffer.getLocation() != null) {
            String locationTag = jobOffer.getLocation()
                    .replace(" ", "")
                    .replace("-", "");
            hashtags.append(" #").append(locationTag);
        }

        return hashtags.toString();
    }

    private LinkedInPostStats parseStatsFromResponse(Map<String, Object> response, String postId) {
        LinkedInPostStats stats = new LinkedInPostStats();
        stats.setPostId(postId);
        stats.setLastUpdated(LocalDateTime.now());

        if (response != null && response.containsKey("elements")) {
            // Implémentation de parsing des statistiques
            // Cette partie dépend de la structure exacte de la réponse LinkedIn
            stats.setLikeCount(0);
            stats.setCommentCount(0);
            stats.setShareCount(0);
            stats.setImpressionCount(0);
            stats.setClickCount(0);
        }

        return stats;
    }
}
