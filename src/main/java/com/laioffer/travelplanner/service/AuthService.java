package com.laioffer.travelplanner.service;

import com.laioffer.travelplanner.entity.UsersEntity;
import com.laioffer.travelplanner.repository.UsersRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UsersRepository usersRepo;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public AuthService(UsersRepository usersRepo,
                       PasswordEncoder passwordEncoder,
                       JdbcTemplate jdbcTemplate) {
        this.usersRepo = usersRepo;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * 注册新用户：
     * 1) 检查邮箱是否已注册
     * 2) 保存到 users 表
     * 3) 用 JdbcTemplate 插入 authorities(user_id, authority)
     */
    public void signup(String username, String email, String rawPassword) {
        // 1) 禁止重复
        if (usersRepo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email 已被注册");
        }

        // 2) 存 users 表，返回带 userId 的实体
        UsersEntity saved = usersRepo.save(new UsersEntity(
                null,
                username,
                email,
                passwordEncoder.encode(rawPassword),
                true
        ));

        // 3) 存 authorities 表，用的是 user_id
        String sql = "INSERT INTO authorities(user_id, authority) VALUES (?, ?)";
        jdbcTemplate.update(sql, saved.userId(), "ROLE_USER");
    }
}