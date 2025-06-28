package com.laioffer.travelplanner.service;

import com.laioffer.travelplanner.entity.*;
import com.laioffer.travelplanner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PoiService {

    private PoiRepository poiRepository;

    public PoiService(PoiRepository poiRepository) {
        this.poiRepository = poiRepository;
    }

    public PoiEntity save(PoiEntity poi) {
        return poiRepository.save(poi);
    }

    public List<PoiEntity> getByCityId(UUID cityId) {
        return poiRepository.findByCityId(cityId);
    }

    public Iterable<PoiEntity> getAll() {
        return poiRepository.findAll();
    }
}