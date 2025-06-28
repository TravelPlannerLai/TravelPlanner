package com.laioffer.travelplanner.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DayPlanSaveRequest(
        int dayNumber,
        LocalDate date,
        List<PoiWithOrderRequest> pois
) {}
