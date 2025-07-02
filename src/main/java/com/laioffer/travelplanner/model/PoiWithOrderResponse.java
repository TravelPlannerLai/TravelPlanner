package com.laioffer.travelplanner.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.util.UUID;

public record PoiWithOrderResponse(
        UUID poiId,
        String name,
        String formattedAddress,
        double lat,
        double lng,
        BigDecimal rating,
        Integer userRatingsTotal,
        String types,
        String photoReference,
        String openingHours,
        int visitOrder
) {}