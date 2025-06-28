package com.laioffer.travelplanner.model;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DayPlanWithRouteResponse(
        UUID dayPlanId,
        int dayNumber,
        LocalDate date,
        List<PoiWithOrderResponse> pois
) {}
