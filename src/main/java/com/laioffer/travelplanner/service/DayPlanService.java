package com.laioffer.travelplanner.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.laioffer.travelplanner.entity.DayPlanEntity;
import com.laioffer.travelplanner.entity.PoiEntity;
import com.laioffer.travelplanner.entity.RouteEntity;
import com.laioffer.travelplanner.model.DayPlanSaveRequest;
import com.laioffer.travelplanner.model.DayPlanWithRouteResponse;
import com.laioffer.travelplanner.model.PoiWithOrderResponse;
import com.laioffer.travelplanner.repository.DayPlanRepository;
import com.laioffer.travelplanner.repository.PoiRepository;
import com.laioffer.travelplanner.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DayPlanService {

    private final DayPlanRepository dayPlanRepository;
    private final PoiRepository poiRepository;
    private final RouteRepository routeRepository;

    public DayPlanService(DayPlanRepository dayPlanRepository, PoiRepository poiRepository, RouteRepository routeRepository) {
        this.dayPlanRepository = dayPlanRepository;
        this.poiRepository = poiRepository;
        this.routeRepository = routeRepository;
    }

    public void saveDayPlanWithRouteAndPois(UUID tripId, DayPlanSaveRequest request) {

        // Save DayPlan
        DayPlanEntity dayPlan = new DayPlanEntity(
                null,
                tripId,
                request.dayNumber(),
                request.planDate()
        );
        dayPlan = dayPlanRepository.save(dayPlan);

        // Save POIs and Route entries
        for (var poiReq : request.pois()) {
            Optional<PoiEntity> existingPoi = poiRepository.findByPlaceId(poiReq.placeId());

            PoiEntity savedPoi;
            if (existingPoi.isPresent()) {
                savedPoi = existingPoi.get();
            } else {
                savedPoi = new PoiEntity(
                        null,
                        poiReq.cityId(),
                        poiReq.placeId(),
                        poiReq.name(),
                        poiReq.formattedAddress(),
                        poiReq.types(),
                        poiReq.lat(),
                        poiReq.lng(),
                        poiReq.openingHours(),
                        poiReq.rating(),
                        poiReq.userRatingsTotal(),
                        poiReq.photoReference()
                );
                savedPoi = poiRepository.save(savedPoi);
            }

            // Save Route
            RouteEntity route = new RouteEntity(
                    null,
                    dayPlan.planId(),
                    savedPoi.poiId(),
                    poiReq.visitOrder()
            );
            routeRepository.save(route);
        }
    }

    public List<DayPlanWithRouteResponse> getDayPlansWithRoutes(UUID tripId) {
        List<DayPlanEntity> dayPlans = dayPlanRepository.findByTripId(tripId);
        List<DayPlanWithRouteResponse> result = new ArrayList<>();

        for (DayPlanEntity plan : dayPlans) {
            List<RouteEntity> routes = routeRepository.findByPlanId(plan.planId());
            routes.sort(Comparator.comparingInt(RouteEntity::visitOrder));

            List<PoiWithOrderResponse> pois = routes.stream()
                    .map(route -> {
                        PoiEntity poi = poiRepository.findById(route.poiId())
                                .orElseThrow(() -> new RuntimeException("POI not found"));

                        return new PoiWithOrderResponse(
                                poi.poiId(),
                                poi.name(),
                                poi.formattedAddress(),
                                poi.lat(),
                                poi.lng(),
                                poi.rating(),
                                poi.userRatingsTotal(),
                                poi.types(),
                                poi.photoReference(),
                                poi.openingHours(),
                                route.visitOrder()
                        );
                    })
                    .collect(Collectors.toList());

            result.add(new DayPlanWithRouteResponse(
                    plan.planId(),
                    plan.dayNumber(),
                    plan.planDate(),
                    pois
            ));
        }

        return result;
    }
}
