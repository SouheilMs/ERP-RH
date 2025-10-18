package com.mycompany.backend.repositories;


import com.mycompany.backend.entities.ERole;
import com.mycompany.backend.entities.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
  Optional<Role> findByName(ERole name);
}
