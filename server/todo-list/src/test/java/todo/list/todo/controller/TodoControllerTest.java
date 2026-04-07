package todo.list.todo.controller;

import jakarta.ws.rs.core.Response;
import java.util.Arrays;
import java.util.List;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import todo.list.common.dto.ErrorResponse;
import todo.list.common.dto.MessageResponse;
import todo.list.todo.dto.request.CreateTodoRequest;
import todo.list.todo.dto.request.UpdateTodoRequest;
import todo.list.todo.dto.response.TodoResponse;
import todo.list.todo.service.TodoService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TodoControllerTest {

    @Mock
    private TodoService todoService;

    @Mock
    private JsonWebToken jwt;

    @InjectMocks
    private TodoController todoController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(jwt.getSubject()).thenReturn("test@example.com");
    }

    @Test
    void testCreateTodo_Success() throws Exception {
        // Arrange
        CreateTodoRequest request = new CreateTodoRequest();
        request.setTitle("Test Todo");
        request.setDescription("Test Description");

        TodoResponse mockResponse = new TodoResponse();
        mockResponse.setId(1L);
        mockResponse.setTitle("Test Todo");

        when(todoService.createTodo(anyString(), any(CreateTodoRequest.class))).thenReturn(mockResponse);

        // Act
        Response response = todoController.createTodo(request);

        // Assert
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        assertEquals(mockResponse, response.getEntity());
        verify(todoService, times(1)).createTodo("test@example.com", request);
    }

    @Test
    void testCreateTodo_Exception() throws Exception {
        // Arrange
        CreateTodoRequest request = new CreateTodoRequest();
        request.setTitle("Test Todo");

        doThrow(new RuntimeException("Creation failed")).when(todoService).createTodo(anyString(),
                any(CreateTodoRequest.class));

        // Act
        Response response = todoController.createTodo(request);

        // Assert
        assertEquals(Response.Status.BAD_REQUEST.getStatusCode(), response.getStatus());
        assertTrue(response.getEntity() instanceof ErrorResponse);
        ErrorResponse errorResponse = (ErrorResponse) response.getEntity();
        assertEquals("Creation failed", errorResponse.getError());
    }

    @Test
    void testGetTodos_Success() throws Exception {
        // Arrange
        TodoResponse mockTodo = new TodoResponse();
        mockTodo.setId(1L);
        List<TodoResponse> mockTodos = Arrays.asList(mockTodo);

        when(todoService.getTodos(anyString(), any(), any(), any(), any(), any(), any(), any())).thenReturn(mockTodos);

        // Act
        Response response = todoController.getTodos(null, null, null, null, null, null, null);

        // Assert
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        assertEquals(mockTodos, response.getEntity());
    }

    @Test
    void testGetTodo_Success() throws Exception {
        // Arrange
        TodoResponse mockResponse = new TodoResponse();
        mockResponse.setId(1L);

        when(todoService.getTodoById(anyString(), anyLong())).thenReturn(mockResponse);

        // Act
        Response response = todoController.getTodo(1L);

        // Assert
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        assertEquals(mockResponse, response.getEntity());
    }

    @Test
    void testGetTodo_Exception() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Todo not found")).when(todoService).getTodoById(anyString(), anyLong());

        // Act
        Response response = todoController.getTodo(1L);

        // Assert
        assertEquals(Response.Status.NOT_FOUND.getStatusCode(), response.getStatus());
        assertTrue(response.getEntity() instanceof ErrorResponse);
    }

    @Test
    void testUpdateTodo_Success() throws Exception {
        // Arrange
        UpdateTodoRequest request = new UpdateTodoRequest();
        request.setTitle("Updated Title");

        TodoResponse mockResponse = new TodoResponse();
        mockResponse.setId(1L);
        mockResponse.setTitle("Updated Title");

        when(todoService.updateTodo(anyString(), anyLong(), any(UpdateTodoRequest.class))).thenReturn(mockResponse);

        // Act
        Response response = todoController.updateTodo(1L, request);

        // Assert
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        assertEquals(mockResponse, response.getEntity());
    }

    @Test
    void testDeleteTodo_Success() throws Exception {
        // Arrange
        doNothing().when(todoService).deleteTodo(anyString(), anyLong());

        // Act
        Response response = todoController.deleteTodo(1L);

        // Assert
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        assertTrue(response.getEntity() instanceof MessageResponse);
        MessageResponse messageResponse = (MessageResponse) response.getEntity();
        assertEquals("Todo deleted successfully!", messageResponse.getMessage());
    }

    @Test
    void testDeleteAllTodos_Success() throws Exception {
        // Arrange
        doNothing().when(todoService).deleteAllTodos(anyString());

        // Act
        Response response = todoController.deleteAllTodos();

        // Assert
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        assertTrue(response.getEntity() instanceof MessageResponse);
        MessageResponse messageResponse = (MessageResponse) response.getEntity();
        assertEquals("All todos deleted successfully!", messageResponse.getMessage());
    }
}