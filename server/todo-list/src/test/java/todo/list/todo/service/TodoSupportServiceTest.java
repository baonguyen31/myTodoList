package todo.list.todo.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import todo.list.todo.dto.response.TodoResponse;
import todo.list.todo.entity.Todo;
import todo.list.todo.entity.enums.PriorityEnum;
import todo.list.todo.entity.enums.StatusEnum;
import todo.list.user.entity.User;
import todo.list.user.repository.UserRepository;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@Transactional
public class TodoSupportServiceTest {

    @Inject
    TodoSupportService todoSupportService;

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
    void testComputeStatusCompleted() {
        testTodo.completed = true;
        StatusEnum status = todoSupportService.computeStatus(testTodo);
        assertEquals(StatusEnum.COMPLETED, status);
    }

    @Test
    void testComputeStatusOverdue() {
        testTodo.dueDate = Instant.now().minusSeconds(86400);
        testTodo.completed = false;
        StatusEnum status = todoSupportService.computeStatus(testTodo);
        assertEquals(StatusEnum.OVERDUE, status);
    }

    @Test
    void testMapTodoResponse() {
        TodoResponse response = todoSupportService.mapTodoResponse(testTodo);
        assertEquals(testTodo.id, response.getId());
        assertEquals("Test Todo", response.getTitle());
        assertEquals(PriorityEnum.MEDIUM, response.getPriority());
        assertEquals(StatusEnum.PENDING, response.getStatus());
    }

    @Test
    void testSetTodoFields() {
        Todo todo = new Todo();
        todoSupportService.setTodoFields(todo, "New Title", "New Desc", Instant.now(), PriorityEnum.HIGH,
                StatusEnum.IN_PROGRESS);
        assertEquals("New Title", todo.title);
        assertEquals(PriorityEnum.HIGH, todo.priority);
        assertEquals(StatusEnum.IN_PROGRESS, todo.status);
    }

    @Test
    void testValidateAndPrepareTodoValid() throws Exception {
        todoSupportService.validateAndPrepareTodo("Valid Title", PriorityEnum.HIGH, StatusEnum.PENDING);
    }

    @Test
    void testValidateAndPrepareTodoInvalidTitle() {
        Exception exception = assertThrows(Exception.class, () -> {
            todoSupportService.validateAndPrepareTodo("a".repeat(101), PriorityEnum.HIGH, StatusEnum.PENDING);
        });
        assertEquals("Title cannot be longer than 100 characters", exception.getMessage());
    }

    @Test
    void testFindUserByEmail() throws Exception {
        User user = todoSupportService.findUserByEmail(testUser.email);
        assertEquals(testUser.email, user.email);
    }

    @Test
    void testFindTodoByIdAndUser() throws Exception {
        Todo todo = todoSupportService.findTodoByIdAndUser(testUser.email, testTodo.id);
        assertEquals(testTodo.id, todo.id);
    }
}