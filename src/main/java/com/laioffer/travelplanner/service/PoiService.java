package com.laioffer.travelplanner.service;

import com.laioffer.travelplanner.entity.PoiEntity;
import com.laioffer.travelplanner.repository.PoiRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PoiService {

    private final PoiRepository poiRepository;

    public PoiService(PoiRepository poiRepository) {
        this.poiRepository = poiRepository;
    }

    public PoiEntity save(PoiEntity poi) {
        return poiRepository.save(poi);
    }

    public Optional<PoiEntity> findByPlaceId(String placeId) {
        return poiRepository.findByPlaceId(placeId);
    }

    public List<PoiEntity> findByCityId(UUID cityId) {
        return poiRepository.findByCityId(cityId);
    }

    public Iterable<PoiEntity> findAll() {
        return poiRepository.findAll();
    }

}