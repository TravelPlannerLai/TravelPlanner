package com.laioffer.travelplanner.config;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

import javax.sql.DataSource;
import java.io.PrintWriter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * 1) 用 JDBC 方式操作 users / authorities
     */
    @Bean
    public JdbcUserDetailsManager userDetailsManager(DataSource ds) {
        JdbcUserDetailsManager mgr = new JdbcUserDetailsManager(ds);

        // 注册新用户时，向 users 表插入（username, email, password, enabled）
        mgr.setCreateUserSql(
                "INSERT INTO users (username, email, password, enabled) VALUES (?, ?, ?, ?)"
        );

        // 授权时，向 authorities 表插入。因为 authorities.user_id 是 FK，所以这里通过子查询拿 user_id
        mgr.setCreateAuthoritySql(
                "INSERT INTO authorities (user_id, authority) " +
                        "VALUES ((SELECT user_id FROM users WHERE email = ?), ?)"
        );

        // 登录校验时，先查 users
        mgr.setUsersByUsernameQuery(
                "SELECT email, password, enabled FROM users WHERE email = ?"
        );

        // 再查 authorities；注意必须返回两列 (username/email, authority)，否则 Spring 内部会去取第 2 列就越界
        mgr.setAuthoritiesByUsernameQuery(
                "SELECT u.email, a.authority " +
                        "  FROM authorities a " +
                        "  JOIN users u ON a.user_id = u.user_id " +
                        " WHERE u.email = ?"
        );

        return mgr;
    }

    /**
     * 2) 密码加密器（Delegating + BCrypt）
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    /**
     * 3) 安全链：放行注册/登录/登出接口，其它都要认证
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 静态资源
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                        // 自己定义的注册 / 登录 / 登出 接口
                        .requestMatchers("/api/user/register", "/api/user/login", "/api/user/logout").permitAll()
                        // 查询所有用户（可选）
                        .requestMatchers("/api/users").permitAll()
                        // 其余接口一律需要登录
                        .anyRequest().authenticated()
                )
                // formLogin：默认拦截 /login GET + POST
                .formLogin(form -> form
                        .loginProcessingUrl("/api/user/login")
                        .successHandler((req, res, auth) -> {
                            res.setStatus(200);
                            res.setContentType("application/json");
                            PrintWriter w = res.getWriter();
                            w.write("{\"status\":200}");
                            w.flush();
                        })
                        .failureHandler((req, res, ex) -> {
                            res.setStatus(401);
                            res.setContentType("application/json");
                            PrintWriter w = res.getWriter();
                            w.write("{\"status\":401,\"error\":\"" + ex.getMessage() + "\"}");
                            w.flush();
                        })
                )
                // logout：默认拦截 /logout
                .logout(logout -> logout
                        .logoutUrl("/api/user/logout")
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler())
                )
        ;

        return http.build();
    }
}