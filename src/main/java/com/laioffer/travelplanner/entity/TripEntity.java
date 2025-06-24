package com.laioffer.travelplanner.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.util.UUID;

@Table("trips")
public record TripEntity(@Id UUID tripId,
                         UUID userId,
                         UUID cityId,
                         LocalDate startDate,
                         int days) {
}
