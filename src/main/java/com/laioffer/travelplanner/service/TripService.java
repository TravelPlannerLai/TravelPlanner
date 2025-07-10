package com.laioffer.travelplanner.service;

import com.laioffer.travelplanner.entity.TripEntity;
import com.laioffer.travelplanner.repository.DayPlanRepository;
import com.laioffer.travelplanner.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TripService {
    private final TripRepository tripRepository;
    private final DayPlanService dayPlanService;

    public TripService(TripRepository tripRepository, DayPlanRepository dayPlanRepository, DayPlanService dayPlanService) {
        this.tripRepository = tripRepository;
        this.dayPlanService = dayPlanService;
    }

    public UUID createTrip(UUID userId, UUID cityId, LocalDate startDate, int days, String name) {
        TripEntity newTrip = new TripEntity(null, userId, cityId, startDate, days, name);
        TripEntity savedTrip = tripRepository.save(newTrip);
        return savedTrip.tripId();
    }

    public TripEntity getTripById(UUID tripId) {
        return tripRepository.getByTripId(tripId);
    }

    public List<TripEntity> getTripsByUserId(UUID userId) {
        return tripRepository.findByUserId(userId);
    }

    public void deleteTrip(UUID tripId) {
        dayPlanService.deleteByTripId(tripId); // Delete routes
        tripRepository.deleteByTripId(tripId);     // Delete trip
    }


}