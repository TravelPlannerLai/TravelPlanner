package com.laioffer.travelplanner.repository;

import com.laioffer.travelplanner.entity.RouteEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

public interface RouteRepository extends CrudRepository<RouteEntity, UUID> {
    List<RouteEntity> findByPlanId(UUID planId);
}
