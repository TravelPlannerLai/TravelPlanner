package com.laioffer.travelplanner.service;

import com.laioffer.travelplanner.entity.UsersEntity;
import com.laioffer.travelplanner.repository.UsersRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private final UsersRepository usersRepo;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final UserDetailsManager userDetailsManager;

    public AuthService(UsersRepository usersRepo,
                       PasswordEncoder passwordEncoder,
                       JdbcTemplate jdbcTemplate,
                       UserDetailsManager userDetailsManager) {
        this.usersRepo = usersRepo;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
        this.userDetailsManager = userDetailsManager;
    }

    /**
     * 注册新用户：
     * 1) 检查邮箱是否已注册
     * 2) 保存到 users 表
     * 3) 用 JdbcTemplate 插入 authorities(user_id, authority)
     */
    @Transactional
    @ResponseStatus(value = HttpStatus.CREATED)
    public UUID signup(String username, String email, String rawPassword) {
        // 1) 禁止重复
        if (usersRepo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email 已被注册");
        }


        // 2) 存 users 表，返回带 userId 的实体
//        UsersEntity saved = usersRepo.save(new UsersEntity(
//                null,
//                username,
//                email,
//                passwordEncoder.encode(rawPassword),
//                true
//        ));

        UserDetails user = User.builder()
                .username(email)
                .password(passwordEncoder.encode(rawPassword))
                .roles("USER")
                .build();
        userDetailsManager.createUser(user);
        usersRepo.updateNameByEmail(email, username);
        UsersEntity u = usersRepo.getByEmail(email);

        // 3) 存 authorities 表，用的是 user_id
        String sql = "INSERT INTO authorities(user_id, authority) VALUES (?, ?)";
        jdbcTemplate.update(sql, u.userId(), "ROLE_USER");
        return u.userId();
    }

    public UUID getIdByEmail(String email) {
        return usersRepo.getByEmail(email).userId();
    }

    public String getNameById(UUID userId) {return usersRepo.getByUserId(userId).username();}
}