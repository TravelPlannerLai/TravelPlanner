package com.laioffer.travelplanner.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Table("users")
public record UsersEntity(
        @Id
        UUID userId,
        String username,
        String email,
        String password,
        boolean enabled
) {}