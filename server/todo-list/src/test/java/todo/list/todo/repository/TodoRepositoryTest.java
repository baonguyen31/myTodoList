package todo.list.todo.repository;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import todo.list.todo.entity.Todo;
import todo.list.todo.entity.enums.PriorityEnum;
import todo.list.todo.entity.enums.StatusEnum;
import todo.list.user.entity.User;
import todo.list.user.repository.UserRepository;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@Transactional
public class TodoRepositoryTest {

    @Inject
    TodoRepository todoRepository;

    @Inject
    UserRepository userRepository;

    private User testUser;
    private Todo testTodo;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.email = "testuser" + System.currentTimeMillis() + "@example.com";
        testUser.passwordHash = "hashedPassword";
        testUser.active = true;
        testUser.createdAt = Instant.now();
        userRepository.persist(testUser);

        testTodo = new Todo();
        testTodo.title = "Test Todo";
        testTodo.description = "Test Description";
        testTodo.completed = false;
        testTodo.dueDate = Instant.now().plusSeconds(86400);
        testTodo.priority = PriorityEnum.MEDIUM;
        testTodo.status = StatusEnum.PENDING;
        testTodo.user = testUser;
        testTodo.persist();
    }

    @Test
    void testFindByUserWithFilters() {
        List<Todo> todos = todoRepository.findByUserWithFilters(testUser, "Test", null,null, null, null, null);
        assertEquals(1, todos.size());
        assertEquals("Test Todo", todos.get(0).title);
    }

    @Test
    void testFindById() {
        Todo found = todoRepository.findById(testTodo.id);
        assertNotNull(found);
        assertEquals(testTodo.id, found.id);
    }

    @Test
    void testSaveTodo() {
        Todo newTodo = new Todo();
        newTodo.title = "New Todo";
        newTodo.user = testUser;
        newTodo.priority = PriorityEnum.HIGH;
        newTodo.status = StatusEnum.IN_PROGRESS;

        Todo saved = todoRepository.saveTodo(newTodo);
        assertNotNull(saved.id);
        assertEquals("New Todo", saved.title);
    }

    @Test
    void testDeleteTodo() {
        Todo toDelete = new Todo();
        toDelete.title = "Delete Me";
        toDelete.user = testUser;
        toDelete.persist();

        todoRepository.deleteTodo(toDelete);
        Todo deleted = todoRepository.findById(toDelete.id);
        assertNull(deleted);
    }
}