package com.laioffer.travelplanner.service;

import com.laioffer.travelplanner.entity.CityEntity;
import com.laioffer.travelplanner.repository.CityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CityService {
    private final CityRepository cityRepository;
    public CityService(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    public UUID saveCity( String name,String country, double lat,double lon) {
        CityEntity newCity = new CityEntity(null, name, country, lat, lon);
        CityEntity savedCity = cityRepository.save(newCity);
        return savedCity.cityId();
    }


    public CityEntity getCityById(UUID cityId) {
        return cityRepository.getCityEntityByCityId(cityId);
    }

    public List<CityEntity> getCitiesByCountry(String country) {
        return cityRepository.getCityEntityByCountry(country);
    }
}
