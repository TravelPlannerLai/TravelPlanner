package com.laioffer.travelplanner.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.laioffer.travelplanner.entity.PoiEntity;
import com.laioffer.travelplanner.entity.TripEntity;
import com.laioffer.travelplanner.model.PoiCreateRequest;
import com.laioffer.travelplanner.model.PoiWithOrderRequest;
import com.laioffer.travelplanner.repository.CityRepository;
import com.laioffer.travelplanner.repository.PoiRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PoiService {

    private final PoiRepository poiRepository;
    private final CityRepository cityRepository;

    public PoiService(PoiRepository poiRepository,CityRepository cityRepository) {
        this.poiRepository = poiRepository;
        this.cityRepository = cityRepository;
    }

    public UUID save(String cityName,
                     PoiCreateRequest poiReq) {
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
        UUID id = null;
        if (cityRepository.findCityEntityByName(cityName).isPresent()){
            PoiEntity newPoi = new PoiEntity(null,cityRepository.findCityEntityByName(cityName).get().cityId(), poiReq.placeId(), poiReq.name(), poiReq.formattedAddress(), typesStr, poiReq.lat(), poiReq.lng(), openingHoursStr,poiReq.rating(),-1,null);
            PoiEntity savedPoi = poiRepository.save(newPoi);
            id = savedPoi.poiId();
        }
        return id;
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