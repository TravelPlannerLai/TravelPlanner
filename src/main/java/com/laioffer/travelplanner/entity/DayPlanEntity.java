package com.laioffer.travelplanner.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.util.UUID;

@Table("day_plans")
public record DayPlanEntity(
        @Id UUID planId,
        UUID tripId,
        int dayNumber,
        LocalDate planDate
) {}
