package com.laioffer.travelplanner.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PoiCreateRequest(
        String placeId,
        String name,
        String formattedAddress,
        JsonNode types,
        double lat,
        double lng,
        String price_level,
        JsonNode openingHours,
        BigDecimal rating
        ) {
}
