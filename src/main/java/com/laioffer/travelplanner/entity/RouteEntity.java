package com.laioffer.travelplanner.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Table("route")
public record RouteEntity(
        @Id UUID id,
        UUID planId,
        UUID poiId,
        int visitOrder
) {}
