package com.laioffer.travelplanner.controller;

import com.laioffer.travelplanner.entity.RouteEntity;
import com.laioffer.travelplanner.service.RouteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping("/plan/{planId}")
    public List<RouteEntity> findByPlanId(@PathVariable UUID planId) {
        return routeService.findByPlanId(planId);
    }
}
