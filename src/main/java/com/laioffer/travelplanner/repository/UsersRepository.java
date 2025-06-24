package com.laioffer.travelplanner.repository;

import com.laioffer.travelplanner.entity.UsersEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsersRepository extends CrudRepository<UsersEntity, UUID> {
    Optional<UsersEntity> findByEmail(String email);
    
    UsersEntity getByEmail(String email);

    @Modifying
    @Query("UPDATE users SET username = :username WHERE email = :email")
    void updateNameByEmail(String email, String username);
}