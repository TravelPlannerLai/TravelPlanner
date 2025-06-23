package com.laioffer.travelplanner.model;

public record RegisterRequest(
        String username,
        String email,
        String password
) { }