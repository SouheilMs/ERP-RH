package com.mycompany.backend.repositories;

import com.mycompany.backend.entities.Conge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CongeRepository extends MongoRepository<Conge, String> {

    List<Conge> findByEmployeeId(String employeeId);
    List<Conge> findByEmployeeIdAndType(String employeeId, String type);
    List<Conge> findByEmployeeIdAndTypeAndStatus(String employeeId, String type, String status);
}