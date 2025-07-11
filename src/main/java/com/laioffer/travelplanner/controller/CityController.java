package com.laioffer.travelplanner.controller;

import com.laioffer.travelplanner.entity.CityEntity;
import com.laioffer.travelplanner.model.SaveCityRequest;
import com.laioffer.travelplanner.repository.CityRepository;
import com.laioffer.travelplanner.service.CityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/city")
public class CityController {
    private final CityService cityService;
    private final CityRepository cityRepository;

    public CityController(CityService cityService, CityRepository cityRepository) {
        this.cityService = cityService;
        this.cityRepository = cityRepository;
    }

    @PostMapping
    public UUID saveCity(
            @RequestBody SaveCityRequest request) {
        if (cityRepository.findCityEntityByName(request.name()).isPresent()) {
            return null;
        }else{
            return cityService.saveCity(
                    request.name(),
                    request.country(),
                    request.lat(),
                    request.lon()
            );
        }
    }

//    @GetMapping("/getCityId/{name}")
//    public UUID getIdByName(@PathVariable("name") String name) {
//        if (cityRepository.findCityEntityByName(name).isPresent()) {
//            return cityRepository.findCityEntityByName(name).get().cityId();
//        }
//        return null;
//    }

    @GetMapping("/name/{name}")
    public CityEntity getCityByName(@PathVariable("name") String name){
        if (cityRepository.findCityEntityByName(name).isPresent()) {
            return cityRepository.findCityEntityByName(name).get();
        }
        return null;
    }

    @GetMapping("/id/{cityId}")
    public CityEntity getCityById(@PathVariable("cityId") UUID cityId){
        return cityService.getCityById(cityId);
    }

    @GetMapping("/country/{country}")
    public List<CityEntity> getCityByCountry(@PathVariable("country") String country){
        return cityService.getCitiesByCountry(country);
    }

}
