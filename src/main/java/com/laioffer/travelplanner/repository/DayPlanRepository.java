package com.laioffer.travelplanner.repository;

import com.laioffer.travelplanner.entity.DayPlanEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DayPlanRepository extends CrudRepository<DayPlanEntity, UUID> {
    List<DayPlanEntity> findByTripId(UUID tripId);
    Optional<DayPlanEntity> findByTripIdAndDayNumberAndPlanDate(UUID tripId, int datNumber, LocalDate planDate);

    @Modifying
    @Query("DELETE FROM day_plans WHERE trip_id = :tripId")
    void deleteByTripId(UUID tripId);

}