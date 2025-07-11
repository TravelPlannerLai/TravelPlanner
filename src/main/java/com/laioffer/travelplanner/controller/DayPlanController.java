package com.laioffer.travelplanner.controller;

import com.laioffer.travelplanner.entity.DayPlanEntity;
import com.laioffer.travelplanner.entity.PoiEntity;
import com.laioffer.travelplanner.model.DayPlanSaveRequest;
import com.laioffer.travelplanner.model.DayPlanWithRouteResponse;
import com.laioffer.travelplanner.service.DayPlanService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dayPlans")
public class DayPlanController {

    private final DayPlanService dayPlanService;

    public DayPlanController(DayPlanService dayPlanService) {
        this.dayPlanService = dayPlanService;
    }

    @PostMapping("/save_route")
    public String saveDayPlanWithRouteAndPois(
            @AuthenticationPrincipal User user,
            @RequestParam UUID tripId,
            @RequestBody DayPlanSaveRequest request) {
        dayPlanService.saveDayPlanWithRouteAndPois(tripId, request);
        return "DayPlan, POIs, and Route saved successfully.";
    }

    @GetMapping("/trip/{tripId}/full-itinerary")
    public List<DayPlanWithRouteResponse> getFullItinerary(@AuthenticationPrincipal User user, @PathVariable UUID tripId) {
        return dayPlanService.getDayPlansWithRoutes(tripId);
    }
}