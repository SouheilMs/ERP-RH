package com.mycompany.backend.repositories;

import com.mycompany.backend.entities.Formation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FormationRepository extends MongoRepository<Formation, String> {
    List<Formation> findByEmployeeId(String employeeId);

}
