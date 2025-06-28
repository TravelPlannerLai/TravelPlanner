package com.laioffer.travelplanner;


import com.laioffer.travelplanner.service.*;
import com.laioffer.travelplanner.entity.*;
import com.laioffer.travelplanner.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;


@Component
public class DevRunner implements ApplicationRunner {


    private static final Logger logger = LoggerFactory.getLogger(DevRunner.class);

    private final AuthService authService;
    private final TripService tripService;
    private final UsersRepository usersRepository;
    private final TripRepository tripRepository;



    public DevRunner(
            AuthService authService, TripService tripService, UsersRepository usersRepository, TripRepository tripRepository) {
        this.authService = authService;
        this.tripService = tripService;
        this.usersRepository = usersRepository;
        this.tripRepository = tripRepository;
    }


    @Override
    public void run(ApplicationArguments args) throws Exception {
        authService.signup("123456", "foo@mail.com", "Foo");
        authService.signup("1qew56", "a@mail.com", "Fo");
        UUID a = authService.signup("1afd456", "b@mail.com", "Fad");
        tripService.createTrip(a,UUID.fromString("f47ac10b-58cc-4372-a567-0e02b2c3d478"), LocalDate.ofEpochDay(1000), 5);
    }
}
