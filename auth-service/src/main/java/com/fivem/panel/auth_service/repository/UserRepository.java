package com.fivem.panel.auth_service.repository;

import com.fivem.panel.auth_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Repositorio para acceder a la tabla users
// Spring se encarga de crear la implementacion solo
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // Busca un usuario por su identifier
    // Spring genera la query automaticamente: SELECT * FROM users WHERE identifier = ?
    Optional<User> findByIdentifier(String identifier);
}
