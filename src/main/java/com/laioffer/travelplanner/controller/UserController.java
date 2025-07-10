package com.laioffer.travelplanner.controller;

import com.laioffer.travelplanner.model.RegisterRequest;
import com.laioffer.travelplanner.service.AuthService;
import com.laioffer.travelplanner.entity.UsersEntity;
import com.laioffer.travelplanner.repository.UsersRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
public class UserController {

    private final AuthService authService;
    private final UsersRepository usersRepo;

    public UserController(AuthService authService,
                          UsersRepository usersRepo) {
        this.authService = authService;
        this.usersRepo   = usersRepo;
    }
    /**
     * === 用户认证 API 总结 ===
     *
     * 1. 登录（Sign-in）
     *    • URL  : POST /api/user/login
     * 2. 登出（Logout）
     *    • URL  : POST /api/user/logout
     * 注意：以上两个接口均为 Spring Security 默认内置的登录/登出接口，无需在 Controller 中额外实现。
     */
    /**
     * 下面是手动实现的接口
     * 1. 注册
     * POST /api/user/register
     */
    @PostMapping("/api/user/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest body, BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }
        try {
            authService.signup(
                    body.username(),
                    body.email(),
                    body.password()   // raw password
            );
            return ResponseEntity.ok(
                    Map.of("status", 200)
            );
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "status", 400,
                            "error",  ex.getMessage()
                    ));
        }
    }

    /**
     * 2. 查询所有用户（可选，用不到也没关系）
     * GET /api/users
     */
    @GetMapping("/api/users")
    public ResponseEntity<Map<String,Object>> listUsers() {
        List<Map<String,Object>> list = new ArrayList<>();
        for (UsersEntity u : usersRepo.findAll()) {
            list.add(Map.of(
                    "user_id",    u.userId(),
                    "username",   u.username(),
                    "email",      u.email()
            ));
        }
        return ResponseEntity.ok(
                Map.of("status", 200, "users", list)
        );
    }

    @GetMapping("/api/users/username")
    public String getUsername(@AuthenticationPrincipal User user){
        UUID id = authService.getIdByEmail(user.getUsername());
        return authService.getNameById(id);
    }
}