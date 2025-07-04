package com.laioffer.travelplanner.controller;

import com.laioffer.travelplanner.entity.PoiEntity;
import com.laioffer.travelplanner.model.PoiCreateRequest;
import com.laioffer.travelplanner.repository.CityRepository;
import com.laioffer.travelplanner.repository.PoiRepository;
import com.laioffer.travelplanner.service.PoiService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pois")
public class PoiController {

    private final PoiService poiService;
    private final PoiRepository poiRepository;

    public PoiController(PoiService poiService, PoiRepository poiRepository) {
        this.poiService = poiService;
        this.poiRepository = poiRepository;

    }

    @PostMapping
    public UUID createPOI(@RequestParam String cityName, @RequestBody PoiCreateRequest poiRequest) {
        if (poiService.findByPlaceId(poiRequest.placeId()).isPresent()) {
            return null;
        }
        return poiService.save(cityName, poiRequest);
    }

    @GetMapping("/city/{cityId}")
    public List<PoiEntity> findByCityId(@PathVariable UUID cityId) {
        return poiService.findByCityId(cityId);
    }

    @GetMapping("/all")
    public Iterable<PoiEntity> findAll() {
        return poiService.findAll();
    }
}
