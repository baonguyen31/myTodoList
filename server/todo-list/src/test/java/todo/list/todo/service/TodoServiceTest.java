package todo.list.todo.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import todo.list.todo.dto.request.CreateTodoRequest;
import todo.list.todo.dto.request.UpdateTodoRequest;
import todo.list.todo.dto.response.TodoResponse;
import todo.list.user.entity.User;
import todo.list.user.repository.UserRepository;
import todo.list.todo.repository.TodoRepository;
import todo.list.todo.entity.enums.PriorityEnum;
import todo.list.todo.entity.enums.StatusEnum;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@Transactional
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class TodoServiceTest {

    @Inject
    TodoService todoService;

    @Inject
    UserRepository userRepository;

    @Inject
    TodoRepository todoRepository;

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
    void testGetTodos() throws Exception {
        CreateTodoRequest request = new CreateTodoRequest();
        request.setTitle("Test Todo");
        request.setPriority(PriorityEnum.MEDIUM);
        request.setStatus(StatusEnum.PENDING);
        todoService.createTodo(testUser.email, request);

        List<TodoResponse> todos = todoService.getTodos(testUser.email, null, null, null, null, null, null, null);
        assertEquals(1, todos.size());
        assertEquals("Test Todo", todos.get(0).getTitle());
    }

    @Test
    void testGetTodoById() throws Exception {
        CreateTodoRequest request = new CreateTodoRequest();
        request.setTitle("Test Todo");
        request.setPriority(PriorityEnum.MEDIUM);
        request.setStatus(StatusEnum.PENDING);
        TodoResponse created = todoService.createTodo(testUser.email, request);

        TodoResponse found = todoService.getTodoById(testUser.email, created.getId());
        assertEquals(created.getId(), found.getId());
    }

    @Test
    void testCreateTodo() throws Exception {
        CreateTodoRequest request = new CreateTodoRequest();
        request.setTitle("New Todo");
        request.setDescription("Desc");
        request.setPriority(PriorityEnum.HIGH);
        request.setStatus(StatusEnum.IN_PROGRESS);

        TodoResponse response = todoService.createTodo(testUser.email, request);
        assertNotNull(response.getId());
        assertEquals("New Todo", response.getTitle());
        assertEquals(PriorityEnum.HIGH, response.getPriority());
        assertEquals(StatusEnum.IN_PROGRESS, response.getStatus());
    }

    @Test
    void testUpdateTodo() throws Exception {
        CreateTodoRequest createRequest = new CreateTodoRequest();
        createRequest.setTitle("Original");
        createRequest.setPriority(PriorityEnum.MEDIUM);
        createRequest.setStatus(StatusEnum.PENDING);
        TodoResponse created = todoService.createTodo(testUser.email, createRequest);

        UpdateTodoRequest updateRequest = new UpdateTodoRequest();
        updateRequest.setTitle("Updated");
        updateRequest.setPriority(PriorityEnum.LOW);
        updateRequest.setStatus(StatusEnum.COMPLETED);
        updateRequest.setCompleted(true);

        TodoResponse updated = todoService.updateTodo(testUser.email, created.getId(), updateRequest);
        assertEquals("Updated", updated.getTitle());
        assertEquals(PriorityEnum.LOW, updated.getPriority());
        assertEquals(StatusEnum.COMPLETED, updated.getStatus());
    }

    @Test
    void testDeleteTodo() throws Exception {
        CreateTodoRequest request = new CreateTodoRequest();
        request.setTitle("To Delete");
        request.setPriority(PriorityEnum.MEDIUM);
        request.setStatus(StatusEnum.PENDING);
        TodoResponse created = todoService.createTodo(testUser.email, request);

        todoService.deleteTodo(testUser.email, created.getId());
        Exception exception = assertThrows(Exception.class, () -> {
            todoService.getTodoById(testUser.email, created.getId());
        });
        assertEquals("Todo not found", exception.getMessage());
    }

    @Test
    void testDeleteAllTodos() throws Exception {
        CreateTodoRequest request1 = new CreateTodoRequest();
        request1.setTitle("Todo 1");
        request1.setPriority(PriorityEnum.MEDIUM);
        request1.setStatus(StatusEnum.PENDING);
        todoService.createTodo(testUser.email, request1);

        CreateTodoRequest request2 = new CreateTodoRequest();
        request2.setTitle("Todo 2");
        request2.setPriority(PriorityEnum.HIGH);
        request2.setStatus(StatusEnum.IN_PROGRESS);
        todoService.createTodo(testUser.email, request2);

        List<TodoResponse> todosBefore = todoService.getTodos(testUser.email, null, null, null, null, null, null, null);
        assertEquals(2, todosBefore.size());

        todoService.deleteAllTodos(testUser.email);

        List<TodoResponse> todosAfter = todoService.getTodos(testUser.email, null, null, null, null, null, null, null);
        assertEquals(0, todosAfter.size());
    }
}