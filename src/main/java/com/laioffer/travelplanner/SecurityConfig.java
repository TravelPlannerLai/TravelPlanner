package com.laioffer.travelplanner;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.*;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.web.cors.*;

import javax.sql.DataSource;
import java.io.PrintWriter;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public UserDetailsManager userDetailsManager(DataSource ds) {
        JdbcUserDetailsManager mgr = new JdbcUserDetailsManager(ds);

        mgr.setCreateUserSql("INSERT INTO users (email, password, enabled) VALUES (?, ?, ?)");
        mgr.setCreateAuthoritySql(
                "INSERT INTO authorities (user_id, authority) VALUES ((SELECT user_id FROM users WHERE email = ?), ?)");
        mgr.setUsersByUsernameQuery("SELECT email, password, enabled FROM users WHERE email = ?");
        mgr.setAuthoritiesByUsernameQuery(
                "SELECT u.email, a.authority FROM authorities a JOIN users u ON a.user_id = u.user_id WHERE u.email = ?");
        return mgr;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 跨域配置
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                        .requestMatchers("/api/user/register", "/api/user/login", "/api/user/logout").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling()
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                .and()
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
                .logout(logout -> logout
                        .logoutUrl("/api/user/logout")
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler())
                );

        return http.build();
    }

    // 配置全局 CORS 策略，允许来自 http://localhost:3000 的前端访问后端 API。
    // 确保前端项目的 package.json 中添加如下配置：
    // "proxy": "http://localhost:8080"
    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}