package org.storestudio.store.component;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.storestudio.store.services.ApiKeyService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Locale;

/** Intentionally NOT a @Component, to avoid a duplicate servlet-filter registration. */
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {
    private final ApiKeyService apiKeyService;

    public ApiKeyAuthenticationFilter(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().startsWith("/api/v1/mcp/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        String rawToken = request.getHeader("X-API-Key");
        if (rawToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        ApiKeyService.AuthenticatedApiKey key = apiKeyService.authenticate(rawToken);
        if (key == null) {
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired API key");
            return;
        }
        var authorities = key.scopes().stream()
                .map(s -> new SimpleGrantedAuthority("MCP_" + s.replace(':', '_').toUpperCase(Locale.ROOT)))
                .toList();
        var authentication = new UsernamePasswordAuthenticationToken(key.email(), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        try {
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
