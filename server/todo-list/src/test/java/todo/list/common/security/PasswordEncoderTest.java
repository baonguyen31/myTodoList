package todo.list.common.security;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class PasswordEncoderTest {

    @Inject
    PasswordEncoder passwordEncoder;

    @Test
    void testHashPassword() {
        String rawPassword = "password123";
        String hashed = passwordEncoder.hash(rawPassword);
        assertNotNull(hashed);
        assertNotEquals(rawPassword, hashed);
        assertTrue(hashed.startsWith("$2a$") || hashed.startsWith("$2b$") || hashed.startsWith("$2y$"));
    }

    @Test
    void testVerifyPasswordValid() {
        String rawPassword = "password123";
        String hashed = passwordEncoder.hash(rawPassword);
        assertTrue(passwordEncoder.verifyPassword(rawPassword, hashed));
    }

    @Test
    void testVerifyPasswordInvalid() {
        String rawPassword = "password123";
        String hashed = passwordEncoder.hash(rawPassword);
        assertFalse(passwordEncoder.verifyPassword("wrongpassword", hashed));
    }

    @Test
    void testHashDifferentPasswords() {
        String password1 = "password123";
        String password2 = "password456";
        String hash1 = passwordEncoder.hash(password1);
        String hash2 = passwordEncoder.hash(password2);
        assertNotEquals(hash1, hash2);
    }
}
