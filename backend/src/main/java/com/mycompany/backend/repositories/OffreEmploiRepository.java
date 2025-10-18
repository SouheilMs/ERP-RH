package com.mycompany.backend.repositories;

import com.mycompany.backend.entities.JobOffer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OffreEmploiRepository extends MongoRepository<JobOffer, String> {
}
