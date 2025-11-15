package com.mycompany.backend.repositories;

import com.mycompany.backend.entities.formation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FormationRepository extends MongoRepository<formation, String> {
    List<formation> findByEmployeeId(String employeeId);

}
