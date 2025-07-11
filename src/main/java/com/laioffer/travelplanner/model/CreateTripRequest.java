package com.laioffer.travelplanner.model;

import java.time.LocalDate;
import java.util.UUID;

public record CreateTripRequest(
        UUID cityId,
        LocalDate startDate,
        int days,
        String name
) {}