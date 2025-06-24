package com.laioffer.travelplanner.controller;

import com.laioffer.travelplanner.entity.TripEntity;
import com.laioffer.travelplanner.model.CreateTripRequest;
import com.laioffer.travelplanner.service.AuthService;
import com.laioffer.travelplanner.service.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;
    private final AuthService authService;

    public TripController(TripService tripService, AuthService authService) {
        this.tripService = tripService;
        this.authService = authService;
    }

    @PostMapping
    public void createTrip(
            @AuthenticationPrincipal User user,
            @RequestBody CreateTripRequest request) {

        // get userId from authenticated user
        UUID userId = authService.getIdByEmail(user.getUsername());

        tripService.createTrip(
                userId,
                request.cityId(),
                request.startDate(),
                request.days()
        );
    }

    @GetMapping("/{tripId}")
    public TripEntity getTripByEmail(@PathVariable("tripId") UUID tripId) {
        return tripService.getTripById(tripId);
    }

    @GetMapping
    public List<TripEntity> getUserTrips(
            @AuthenticationPrincipal User user
    ) {
        UUID userId = authService.getIdByEmail(user.getUsername());
        System.out.println(userId);
        return tripService.getTripsByUserId(userId);
    }


}