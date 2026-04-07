package todo.list.user.repository;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import todo.list.user.entity.User;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@Transactional
public class UserRepositoryTest {

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
    void testFindByEmail() {
        User found = userRepository.findByEmail(testUser.email);
        assertNotNull(found);
        assertEquals(testUser.email, found.email);
    }

    @Test
    void testExistsByEmail() {
        assertTrue(userRepository.existsByEmail(testUser.email));
        assertFalse(userRepository.existsByEmail("nonexistent@example.com"));
    }

    @Test
    void testSaveUser() {
        User newUser = new User();
        newUser.email = "new-repo" + System.currentTimeMillis() + "@example.com";
        newUser.passwordHash = "newpass";

        User saved = userRepository.saveUser(newUser);
        assertNotNull(saved.id);
        assertEquals(newUser.email, saved.email);
    }
}