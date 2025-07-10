package com.laioffer.travelplanner.repository;

import com.laioffer.travelplanner.entity.RouteEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface RouteRepository extends CrudRepository<RouteEntity, UUID> {
    List<RouteEntity> findByPlanId(UUID planId);

    @Transactional
    @Modifying
    @Query("DELETE FROM route r WHERE r.plan_id = :planId")
    void deleteByPlanId(UUID planId);
}
