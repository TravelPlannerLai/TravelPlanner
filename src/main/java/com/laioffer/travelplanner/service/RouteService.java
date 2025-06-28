package com.laioffer.travelplanner.service;

import com.laioffer.travelplanner.entity.RouteEntity;
import com.laioffer.travelplanner.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RouteService {
    private final RouteRepository repository;

    public RouteService(RouteRepository repository) {
        this.repository = repository;
    }

    public RouteEntity save(RouteEntity entity) {
        return repository.save(entity);
    }

    public List<RouteEntity> getByPlanId(UUID planId) {
        return repository.findByPlanId(planId);
    }
}
