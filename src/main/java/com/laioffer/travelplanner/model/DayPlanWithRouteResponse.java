package com.laioffer.travelplanner.model;

import org.springframework.data.relational.core.mapping.Column;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DayPlanWithRouteResponse(
        UUID dayPlanId,
        int dayNumber,
        @Column("plandate")
        LocalDate planDate,
        List<PoiWithOrderResponse> pois
) {}
