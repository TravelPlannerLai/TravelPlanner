package com.laioffer.travelplanner.repository;

import com.laioffer.travelplanner.entity.UsersEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface UsersRepository extends CrudRepository<UsersEntity, UUID> {
    Optional<UsersEntity> findByEmail(String email);
}