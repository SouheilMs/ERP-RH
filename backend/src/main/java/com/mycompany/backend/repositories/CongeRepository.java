package com.mycompany.backend.repositories;

import com.mycompany.backend.entities.Conge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CongeRepository extends MongoRepository<Conge, String> {
}
