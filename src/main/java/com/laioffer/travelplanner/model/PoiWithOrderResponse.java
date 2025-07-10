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
        JsonNode types,
        String photoReference,
        JsonNode openingHours,
        int visitOrder,
        String place_id
) {}