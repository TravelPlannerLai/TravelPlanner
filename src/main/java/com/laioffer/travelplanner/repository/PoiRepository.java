package com.laioffer.travelplanner.repository;

import com.laioffer.travelplanner.entity.PoiEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PoiRepository extends CrudRepository<PoiEntity, UUID> {
    List<PoiEntity> findByCityId(UUID cityId);
    Optional<PoiEntity> findByPlaceId(String placeId);
}
