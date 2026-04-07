package todo.list.common.security;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;

@QuarkusTest
public class JwtGeneratorTest {

    @Inject
    JwtGenerator jwtGenerator;

    @Test
    void testGenerateToken() {
        String email = "test@example.com";

        String token = jwtGenerator.generateToken(email);
        assertNotNull(token);
        assertTrue(token.startsWith("eyJ"));
        assertTrue(token.length() > 100);
    }

    @Test
    void testGenerateTokenWithDifferentEmail() {
        String email1 = "user1@example.com";
        String email2 = "user2@example.com";

        String token1 = jwtGenerator.generateToken(email1);
        String token2 = jwtGenerator.generateToken(email2);

        assertNotNull(token1);
        assertNotNull(token2);
        assertNotEquals(token1, token2);
    }
}
