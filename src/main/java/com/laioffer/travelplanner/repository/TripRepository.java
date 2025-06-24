package com.laioffer.travelplanner.repository;

import com.laioffer.travelplanner.entity.TripEntity;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.UUID;

public interface TripRepository extends ListCrudRepository<TripEntity, UUID> {
    TripEntity getByTripId(UUID tripId);

    List<TripEntity> findByUserId(UUID userId);

}