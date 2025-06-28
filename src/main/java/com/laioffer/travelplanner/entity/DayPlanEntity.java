package com.laioffer.travelplanner.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Table("day_plans")
public record DayPlanEntity(
        @Id UUID planId,
        UUID tripId,
        int dayNumber,
        LocalDate date
) {}
