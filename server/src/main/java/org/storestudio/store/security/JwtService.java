package org.storestudio.store.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {

    @Value("${spring.jwt.secret}")
    private String secret;

    @jakarta.annotation.PostConstruct
    void validateSecret() {
        if (secret == null || secret.length() < 64 || secret.startsWith("REPLACE") || secret.startsWith("change_me")) {
            throw new IllegalStateException("Configure a random JWT_SECRET (openssl rand -hex 48) before starting the backend");
        }
    }

    public String generateToken(String email) {
        long expiration = 86400 * 1000L; // 1 day in milliseconds
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes()))
                .compact();
    }

    public String extractEmail(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }
        Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(secret.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7).trim();
            }
            Claims claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(secret.getBytes()))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}