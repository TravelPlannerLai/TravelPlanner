package com.laioffer.travelplanner.service;

import com.laioffer.travelplanner.entity.RouteEntity;
import com.laioffer.travelplanner.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.Comparator;

@Service
public class RouteService {
    private final RouteRepository routeRepository;

    public RouteService(RouteRepository repository) {
        this.routeRepository = repository;
    }

    public RouteEntity save(RouteEntity entity) {
        return routeRepository.save(entity);
    }

    public List<RouteEntity> findByPlanId(UUID planId) {
        List<RouteEntity> routes = routeRepository.findByPlanId(planId);
        routes.sort(Comparator.comparingInt(RouteEntity::visitOrder));
        return routes;
    }
}
