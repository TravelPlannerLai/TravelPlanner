package com.laioffer.travelplanner.model;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.data.relational.core.mapping.Column;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DayPlanSaveRequest(
        int dayNumber,
        @Column("plandate")
        LocalDate planDate,
        List<PoiWithOrderRequest> pois
) {}
