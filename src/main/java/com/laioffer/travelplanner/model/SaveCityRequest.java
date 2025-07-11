package com.laioffer.travelplanner.model;

public record SaveCityRequest(
        String name,
        String country,
        double lat,
        double lon
) {
}
