package com.mycompany.backend.services;

import com.mycompany.backend.entities.Employee;
import java.util.List;
import java.util.Map;

public interface SalaryCalculationService {

    /**
     * Calcule l'ancienneté avec prime de 9 dinars
     */
    Map<String, Object> calculateSeniorityBonus(Employee employee);

    /**
     * Calcule l'IRPP selon l'échelle tunisienne
     */
    Double calculateIRPP(Double taxableIncome);

    /**
     * Calcule le salaire net complet
     */
    Map<String, Object> calculateCompleteSalary(Employee employee, Map<String, Object> seniorityInfo);

    /**
     * Génère les années disponibles depuis l'embauche
     */
    List<Integer> generateYearsFromHireDate(Employee employee);
}