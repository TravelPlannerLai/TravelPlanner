package com.laioffer.travelplanner.controller;

import com.laioffer.travelplanner.entity.PoiEntity;
import com.laioffer.travelplanner.entity.RouteEntity;
import com.laioffer.travelplanner.model.DayPlanRouteSaveRequest;
import com.laioffer.travelplanner.service.PoiService;
import com.laioffer.travelplanner.service.RouteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dayplans")
public class DayPlanController {

    private final RouteService routeService;
    private final PoiService poiService;

    public DayPlanController(RouteService routeService, PoiService poiService) {
        this.routeService = routeService;
        this.poiService = poiService;
    }

    @PostMapping("/{planId}/save-route")
    public String saveDayPlanRouteAndPois(
            @PathVariable UUID planId,
            @RequestBody List<DayPlanRouteSaveRequest> poisWithOrder) {

        for (DayPlanRouteSaveRequest poiRequest : poisWithOrder) {
            // Save POI
            PoiEntity newPoi = new PoiEntity(
                    UUID.randomUUID(),
                    poiRequest.cityId(),
                    poiRequest.placeId(),
                    poiRequest.name(),
                    poiRequest.formattedAddress(),
                    poiRequest.types(),
                    poiRequest.lat(),
                    poiRequest.lng(),
                    poiRequest.openingHours(),
                    poiRequest.rating(),
                    poiRequest.userRatingsTotal(),
                    poiRequest.photoReference()
            );
            poiService.save(newPoi);

            // Save Route with POI ID
            RouteEntity newRoute = new RouteEntity(
                    UUID.randomUUID(),
                    planId,
                    newPoi.poiId(),
                    poiRequest.visitOrder()
            );
            routeService.save(newRoute);
        }

        return "DayPlan route and POIs saved successfully.";
    }
}