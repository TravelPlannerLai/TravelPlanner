package com.laioffer.travelplanner.repository;

import com.laioffer.travelplanner.entity.TripEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TripRepository extends ListCrudRepository<TripEntity, UUID> {
    TripEntity getByTripId(UUID tripId);

    List<TripEntity> findByUserId(UUID userId);

    @Modifying
    @Query("DELETE FROM trips WHERE trip_id = :tripId")
    void deleteByTripId(UUID tripId);


}