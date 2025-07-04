package com.laioffer.travelplanner.controller;

import com.laioffer.travelplanner.entity.PoiEntity;
import com.laioffer.travelplanner.model.PoiCreateRequest;
import com.laioffer.travelplanner.service.PoiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pois")
public class PoiController {

    private final PoiService poiService;

    public PoiController(PoiService poiService) {
        this.poiService = poiService;
    }

//    @PostMapping
//    public ResponseEntity<PoiEntity> createPOI(@RequestBody PoiCreateRequest poiRequest) {
//        PoiEntity savedPOI = poiService.savePOI(poiRequest);
//        return ResponseEntity.status(HttpStatus.CREATED).body(savedPOI);
//    }

    @GetMapping("/city/{cityId}")
    public List<PoiEntity> findByCityId(@PathVariable UUID cityId) {
        return poiService.findByCityId(cityId);
    }

    @GetMapping("/all")
    public Iterable<PoiEntity> findAll() {
        return poiService.findAll();
    }
}
