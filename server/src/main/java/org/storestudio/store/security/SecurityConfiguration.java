package org.storestudio.store.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.storestudio.store.component.JwtAuthenticationFilter;
import org.storestudio.store.component.ApiKeyAuthenticationFilter;
import org.storestudio.store.services.ApiKeyService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ApiKeyService apiKeyService;

    // For same-site reverse proxies that change the Host header, the browser's
    // public Origin must still be permitted by Spring's CORS filter.
    // Replace the development tunnel wildcard with your own store domain in production.
    @Value("${CORS_ALLOWED_ORIGIN_PATTERNS:http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,https://*.trycloudflare.com}")
    private String allowedOriginPatterns;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/setup/status").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/setup/owner").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/setup/complete").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers("/api/v1/setup/**").denyAll()
                        .requestMatchers(
                                "/auth/**",
                                "/api/v1/auth/**",
                                "/swagger/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml"
                        ).permitAll()
                        // MCP endpoints accept scoped X-API-Key credentials, never owner JWT privileges.
                        .requestMatchers(HttpMethod.GET, "/api/v1/mcp/products").hasAuthority("MCP_PRODUCTS_READ")
                        .requestMatchers(HttpMethod.GET, "/api/v1/mcp/orders").hasAuthority("MCP_ORDERS_READ")
                        .requestMatchers(HttpMethod.GET, "/api/v1/mcp/analytics").hasAuthority("MCP_ANALYTICS_READ")
                        .requestMatchers(HttpMethod.GET, "/api/v1/mcp/settings").hasAuthority("MCP_SETTINGS_READ")
                        .requestMatchers("/api/v1/mcp/**").denyAll()
                        .requestMatchers("/api/carts", "/api/carts/**", "/api/v1/carts", "/api/v1/carts/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/orders", "/api/orders/", "/api/v1/orders", "/api/v1/orders/").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**", "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/stores/**", "/api/stores/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/store/**", "/api/store/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/feedbacks/store", "/api/v1/feedbacks/product/**", "/api/v1/feedbacks").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/settings/**", "/api/settings/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/settings/**", "/api/settings/**", "/api/v1/store/**", "/api/store/**").hasAnyRole("OWNER", "SELLER", "ADMIN")
                        .requestMatchers("/api/seller/**", "/api/v1/seller/**", "/api/owner/**", "/api/v1/owner/**").hasAnyRole("OWNER", "SELLER", "ADMIN")
                        .requestMatchers("/api/admin/**", "/api/v1/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new ApiKeyAuthenticationFilter(apiKeyService), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Patterns allow temporary Cloudflare Tunnel hostnames while keeping
        // the production allowlist deployer-configurable (never use '*').
        configuration.setAllowedOriginPatterns(Arrays.stream(allowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(pattern -> !pattern.isEmpty())
                .toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}