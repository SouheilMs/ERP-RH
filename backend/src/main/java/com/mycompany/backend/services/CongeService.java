package com.mycompany.backend.services;

import com.mycompany.backend.entities.Conge;
import com.mycompany.backend.payload.request.CongeRequestDTO;
import com.mycompany.backend.payload.response.CongeStatusUpdateDTO;

import java.util.List;
import java.util.Optional;

public interface CongeService {

    List<Conge> getEmployeeConges(String employeeId);

    Optional<Conge> getCongeById(String congeId);

    List<Conge> getAllPendingConges();

    List<Conge> getAllConges();

    Conge submitCongeRequest(String employeeId, CongeRequestDTO requestDTO);

    Conge updateCongeStatus(String congeId, String managerId, CongeStatusUpdateDTO statusDTO);

    void deleteConge(String congeId, String employeeId);
}
