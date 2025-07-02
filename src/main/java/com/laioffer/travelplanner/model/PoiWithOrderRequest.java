package com.laioffer.travelplanner.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.util.UUID;

public record PoiWithOrderRequest(
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
        String photoReference,
        int visitOrder
) {}
