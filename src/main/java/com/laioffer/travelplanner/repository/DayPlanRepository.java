package com.laioffer.travelplanner.repository;

import com.laioffer.travelplanner.entity.DayPlanEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

public interface DayPlanRepository extends CrudRepository<DayPlanEntity, UUID> {
    List<DayPlanEntity> findByTripId(UUID tripId);
}