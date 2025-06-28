package com.laioffer.travelplanner.service;

import com.laioffer.travelplanner.entity.DayPlanEntity;
import com.laioffer.travelplanner.repository.DayPlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DayPlanService {
    private final DayPlanRepository dayPlanRepository;

    public DayPlanService(DayPlanRepository dayPlanRepository) {
        this.dayPlanRepository = dayPlanRepository;
    }

    public DayPlanEntity save(DayPlanEntity plan) {
        return dayPlanRepository.save(plan);
    }

    public List<DayPlanEntity> getByTripId(UUID tripId) {
        return dayPlanRepository.findByTripId(tripId);
    }

    public Iterable<DayPlanEntity> getAll() {
        return dayPlanRepository.findAll();
    }
}

