package com.laioffer.travelplanner.entity;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Table("pois")
public record PoiEntity(
        @Id UUID poiId,
        UUID cityId,
        String placeId,
        String name,
        String formattedAddress,
        String types,
        double lat,
        double lng,
        String openingHours,
        BigDecimal rating,
        Integer userRatingsTotal,
        String photoReference
) {}