package com.laioffer.travelplanner.repository;

import com.laioffer.travelplanner.entity.CityEntity;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CityRepository extends ListCrudRepository<CityEntity, UUID> {
    Optional<CityEntity> findCityEntityByName(String name);
    CityEntity getCityEntityByCityId(UUID cityId);
    List<CityEntity> getCityEntityByCountry(String country);

}
