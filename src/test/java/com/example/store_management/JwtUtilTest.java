package com.example.store_management;

import com.example.store_management.config.JwtUtil;
import com.example.store_management.service.ActiveUserRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    // Must be at least 32 chars for HMAC-SHA256
    private static final String SECRET =
            "test-secret-key-at-least-32-chars-long!!";
    private static final long EXPIRATION = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, EXPIRATION);
    }

    @Test
    void generateToken_shouldReturnNonNullToken() {
        String token = jwtUtil.generateToken("alice", "CUSTOMER");
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void extractUsername_shouldReturnCorrectUsername() {
        String token = jwtUtil.generateToken("alice", "CUSTOMER");
        assertEquals("alice", jwtUtil.extractUsername(token));
    }

    @Test
    void extractRole_shouldReturnCorrectRole() {
        String token = jwtUtil.generateToken("alice", "ADMIN");
        assertEquals("ADMIN", jwtUtil.extractRole(token));
    }

    @Test
    void isTokenValid_withValidToken_shouldReturnTrue() {
        String token = jwtUtil.generateToken("alice", "CUSTOMER");
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void isTokenValid_withTamperedToken_shouldReturnFalse() {
        String token = jwtUtil.generateToken("alice", "CUSTOMER");
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertFalse(jwtUtil.isTokenValid(tampered));
    }

    @Test
    void isTokenValid_withExpiredToken_shouldReturnFalse() {
        // Create a util with -1ms expiration so it's already expired
        JwtUtil expiredUtil = new JwtUtil(SECRET, -1L);
        String token = expiredUtil.generateToken("alice", "CUSTOMER");
        assertFalse(expiredUtil.isTokenValid(token));
    }

    @Test
    void differentUsers_shouldGetDifferentTokens() {
        String token1 = jwtUtil.generateToken("alice", "CUSTOMER");
        String token2 = jwtUtil.generateToken("bob",   "CUSTOMER");
        assertNotEquals(token1, token2);
    }

    static class ActiveUserRegistryTest {

        private ActiveUserRegistry registry;

        @BeforeEach
        void setUp() {
            registry = new ActiveUserRegistry();
        }

        @Test
        void initially_noUsersAreLoggedIn() {
            assertFalse(registry.isAnyoneLoggedIn());
            assertTrue(registry.getActiveUsers().isEmpty());
        }

        @Test
        void userLoggedIn_shouldAddUserToRegistry() {
            registry.userLoggedIn("alice");

            assertTrue(registry.isAnyoneLoggedIn());
            assertTrue(registry.getActiveUsers().contains("alice"));
        }

        @Test
        void userLoggedOut_shouldRemoveUserFromRegistry() {
            registry.userLoggedIn("alice");
            registry.userLoggedOut("alice");

            assertFalse(registry.isAnyoneLoggedIn());
            assertFalse(registry.getActiveUsers().contains("alice"));
        }

        @Test
        void multipleUsers_canBeTrackedSimultaneously() {
            registry.userLoggedIn("alice");
            registry.userLoggedIn("bob");
            registry.userLoggedIn("carol");

            assertEquals(3, registry.getActiveUsers().size());
        }

        @Test
        void loggingOutOneUser_doesNotAffectOthers() {
            registry.userLoggedIn("alice");
            registry.userLoggedIn("bob");
            registry.userLoggedOut("alice");

            assertFalse(registry.getActiveUsers().contains("alice"));
            assertTrue(registry.getActiveUsers().contains("bob"));
            assertEquals(1, registry.getActiveUsers().size());
        }

        @Test
        void loggingOutNonExistentUser_shouldNotThrow() {
            assertDoesNotThrow(() -> registry.userLoggedOut("ghost"));
        }

        @Test
        void sameUser_loginTwice_shouldNotDuplicate() {
            registry.userLoggedIn("alice");
            registry.userLoggedIn("alice");

            assertEquals(1, registry.getActiveUsers().size());
        }
    }
}