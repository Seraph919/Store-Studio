package org.storestudio.store.component;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.storestudio.store.services.ApiKeyService;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ApiKeyAuthenticationFilterTest {
    private final ApiKeyService service = mock(ApiKeyService.class);
    private final ApiKeyAuthenticationFilter filter = new ApiKeyAuthenticationFilter(service);

    @AfterEach
    void cleanUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void scopedKeyAuthenticatesMcpRequest() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/mcp/orders");
        request.setServletPath("/api/v1/mcp/orders");
        request.addHeader("X-API-Key", "example-key");
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(service.authenticate("example-key"))
                .thenReturn(new ApiKeyService.AuthenticatedApiKey("seller@test.example", Set.of("orders:read")));
        AtomicBoolean invoked = new AtomicBoolean(false);
        FilterChain chain = (req, res) -> {
            invoked.set(true);
            var auth = SecurityContextHolder.getContext().getAuthentication();
            assertNotNull(auth);
            assertEquals("seller@test.example", auth.getName());
            assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("MCP_ORDERS_READ")));
            assertFalse(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().startsWith("ROLE_")));
        };
        filter.doFilter(request, response, chain);
        assertTrue(invoked.get());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void invalidKeyReturnsUnauthorized() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/mcp/products");
        request.setServletPath("/api/v1/mcp/products");
        request.addHeader("X-API-Key", "invalid");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean invoked = new AtomicBoolean(false);
        filter.doFilter(request, response, (req, res) -> invoked.set(true));
        assertEquals(401, response.getStatus());
        assertFalse(invoked.get());
    }

    @Test
    void keyHeaderIsIgnoredOutsideMcpEndpoints() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("DELETE", "/api/v1/admin/users/7");
        request.setServletPath("/api/v1/admin/users/7");
        request.addHeader("X-API-Key", "example-key");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean invoked = new AtomicBoolean(false);
        filter.doFilter(request, response, (req, res) -> invoked.set(true));
        assertTrue(invoked.get());
        verifyNoInteractions(service);
    }
}
