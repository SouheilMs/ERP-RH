package com.mycompany.backend.repositories;

import com.mycompany.backend.entities.Payslip;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends MongoRepository<Payslip, String> {

    // Méthodes existantes
    List<Payslip> findByEmployeeIdOrderByYearDescMonthDesc(String employeeId);

    List<Payslip> findByEmployeeIdAndYearOrderByMonthDesc(String employeeId, int year);

    Optional<Payslip> findByEmployeeIdAndYearAndMonth(String employeeId, int year, int month);

    // NOUVELLE MÉTHODE : Recherche plus robuste avec query personnalisée
    @Query("{ 'employee.$id': ?0, 'year': ?1 }")
    List<Payslip> findByEmployeeIdAndYearRobust(String employeeId, int year);

    // NOUVELLE MÉTHODE : Récupérer les années distinctes avec les fiches existantes
    @Query(value = "{ 'employee.$id': ?0 }", fields = "{ 'year': 1 }")
    List<Payslip> findDistinctYearsByEmployeeId(String employeeId);

    // Méthode pour compter les fiches par employé
    long countByEmployeeId(String employeeId);
}