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

        Optional<DayPlanEntity> existingDayPlan = dayPlanRepository.findByTripIdAndDayNumberAndPlanDate(
                tripId,
                request.dayNumber(),
                request.planDate()
        );

        // Use the existing DayPlanEntity if it exists; otherwise, create a new one
        DayPlanEntity dayPlan = existingDayPlan.orElseGet(() -> {
            DayPlanEntity newDayPlan = new DayPlanEntity(
                    null,
                    tripId,
                    request.dayNumber(),
                    request.planDate()
            );
            return dayPlanRepository.save(newDayPlan);
        });

        // Retrieve the existing day plan and remove all its associated routes
        // Delete associated routes
        existingDayPlan.ifPresent(dayPlanEntity -> routeRepository.deleteByPlanId(dayPlanEntity.planId()));

        // Save POIs and Route entries
        for (var poiReq : request.pois()) {
            Optional<PoiEntity> existingPoi = poiRepository.findByPlaceId(poiReq.placeId());

            PoiEntity savedPoi;
            if (existingPoi.isPresent()) {
                savedPoi = existingPoi.get();
            } else {

                ObjectMapper mapper = new ObjectMapper();
                String typesStr;
                String openingHoursStr;


                try {
                    typesStr = poiReq.types() != null
                            ? mapper.writeValueAsString(poiReq.types())
                            : null;

                    openingHoursStr = poiReq.openingHours() != null
                            ? mapper.writeValueAsString(poiReq.openingHours())
                            : null;
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("JSON serialization failed", e);
                }

                savedPoi = new PoiEntity(
                        null,
                        poiReq.cityId(),
                        poiReq.placeId(),
                        poiReq.name(),
                        poiReq.formattedAddress(),
                        typesStr,
                        poiReq.lat(),
                        poiReq.lng(),
                        openingHoursStr,
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

                        ObjectMapper mapper = new ObjectMapper();

                        JsonNode typesNode = null;
                        JsonNode openingHours = null;

                        try {
                            if (poi.openingHours() != null) {
                                openingHours = mapper.readTree(poi.openingHours());
                            }
                            if (poi.types() != null) {
                                typesNode = mapper.readTree(poi.types());
                            }
                        } catch (JsonProcessingException e) {
                            throw new RuntimeException("JSON parse failed", e);
                        }

                        return new PoiWithOrderResponse(
                                poi.poiId(),
                                poi.name(),
                                poi.formattedAddress(),
                                poi.lat(),
                                poi.lng(),
                                poi.rating(),
                                poi.userRatingsTotal(),
                                typesNode,
                                poi.photoReference(),
                                openingHours,
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

    public void deleteByTripId(UUID tripId) {
        // Find all day plans associated with the given tripId
        List<DayPlanEntity> plans = dayPlanRepository.findByTripId(tripId);

        // Delete all associated routes for each day plan
        plans.forEach(dayPlan -> routeRepository.deleteByPlanId(dayPlan.planId()));

        // Delete all day plans
        dayPlanRepository.deleteByTripId(tripId);

    }
}

