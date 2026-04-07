package todo.list.user.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import todo.list.user.entity.User;
import todo.list.user.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@Transactional
public class UserServiceTest {

    @Inject
    UserService userService;

    @Inject
    UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.email = "testuser" + System.currentTimeMillis() + "@example.com";
        testUser.passwordHash = "hashedPassword";
        testUser.active = true;
        testUser.createdAt = Instant.now();
        userRepository.persist(testUser);
    }

    @Test
    void testFindByEmail() throws Exception {
        userService.register("find@example.com", "password123456");

        User found = userService.findByEmail("find@example.com").orElse(null);
        assertNotNull(found);
        assertEquals("find@example.com", found.email);
    }

    @Test
    void testExistsByEmail() throws Exception {
        userService.register("exists@example.com", "password123456");

        assertTrue(userService.existsByEmail("exists@example.com"));
        assertFalse(userService.existsByEmail("nonexistent@example.com"));
    }

    @Test
    void testRegister() throws Exception {
        User registered = userService.register("register@example.com", "password123456");
        assertNotNull(registered.id);
        assertEquals("register@example.com", registered.email);
        assertNotNull(registered.passwordHash);
    }

    @Test
    void testRegisterDuplicateEmail() throws Exception {
        userService.register("duplicate@example.com", "password123456");

        Exception exception = assertThrows(Exception.class, () -> {
            userService.register("duplicate@example.com", "password123456");
        });
        assertEquals("Email already exists", exception.getMessage());
    }

    @Test
    void testRegisterShortPassword() {
        Exception exception = assertThrows(Exception.class, () -> {
            userService.register("short@example.com", "short");
        });
        assertEquals("Password must be at least 10 characters long", exception.getMessage());
    }

    @Test
    void testLogin() throws Exception {
        userService.register("login@example.com", "password123456");

        String token = userService.login("login@example.com", "password123456");
        assertNotNull(token);
        assertTrue(token.startsWith("eyJ"));
    }

    @Test
    void testLoginInvalidEmail() {
        Exception exception = assertThrows(Exception.class, () -> {
            userService.login("invalid@example.com", "password123456");
        });
        assertEquals("User not found!", exception.getMessage());
    }

    @Test
    void testLoginInvalidPassword() throws Exception {
        userService.register("wrongpass@example.com", "password123456");

        Exception exception = assertThrows(Exception.class, () -> {
            userService.login("wrongpass@example.com", "wrongpassword");
        });
        assertEquals("Invalid credentials!", exception.getMessage());
    }
}