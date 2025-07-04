package com.laioffer.travelplanner.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.util.UUID;

@Table("cities")
public record CityEntity(@Id UUID cityId,
                         String name,
                         String  country,
                         double lat,
                         double lon) {
}
