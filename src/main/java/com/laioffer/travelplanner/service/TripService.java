package com.laioffer.travelplanner.service;

import com.laioffer.travelplanner.entity.TripEntity;
import com.laioffer.travelplanner.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TripService {
    private final TripRepository tripRepository;

    public TripService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    public void createTrip(UUID userId, UUID cityId, LocalDate startDate, int days) {
        TripEntity newTrip = new TripEntity(null, userId, cityId, startDate, days);
        tripRepository.save(newTrip);
    }

    public TripEntity getTripById(UUID tripId) {
        return tripRepository.getByTripId(tripId);
    }

    public List<TripEntity> getTripsByUserId(UUID userId) {
        return tripRepository.findByUserId(userId);
    }

}