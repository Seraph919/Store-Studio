package org.storestudio.store.security;

import org.junit.jupiter.api.Test;
import org.storestudio.store.component.JwtAuthenticationFilter;
import org.storestudio.store.services.ApiKeyService;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;

class SecurityConfigurationCorsTest {

    @Test
    void tunnelOriginIsPermittedButArbitraryOriginIsNot() {
        SecurityConfiguration config = new SecurityConfiguration(
                mock(JwtAuthenticationFilter.class), mock(ApiKeyService.class));
        ReflectionTestUtils.setField(config, "allowedOriginPatterns",
                "http://localhost:5173,https://*.trycloudflare.com");
        var request = new MockHttpServletRequest("POST", "/api/carts");
        var cors = config.corsConfigurationSource().getCorsConfiguration(request);
        assertNotNull(cors);

        assertEquals("https://demo.trycloudflare.com",
                cors.checkOrigin("https://demo.trycloudflare.com"));
        assertEquals("http://localhost:5173",
                cors.checkOrigin("http://localhost:5173"));
        assertNull(cors.checkOrigin("https://untrusted.example"));
    }
}
