package todo.list.auth.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import todo.list.auth.dto.request.LoginRequest;
import todo.list.auth.dto.request.RegisterRequest;
import todo.list.auth.dto.response.LoginResponse;
import todo.list.common.dto.ErrorResponse;
import todo.list.common.dto.MessageResponse;
import todo.list.user.service.UserService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    @Test
    void testRegister_Success() throws Exception {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userService.register(anyString(), anyString())).thenReturn(null);

        // Act
        Response response = authController.register(request);

        // Assert
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        assertTrue(response.getEntity() instanceof MessageResponse);
        MessageResponse messageResponse = (MessageResponse) response.getEntity();
        assertEquals("Registered Successfully!", messageResponse.getMessage());
        verify(userService, times(1)).register("test@example.com", "password123");
    }

    @Test
    void testRegister_Exception() throws Exception {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userService.register(anyString(), anyString())).thenThrow(new RuntimeException("Registration failed"));

        // Act
        Response response = authController.register(request);

        // Assert
        assertEquals(Response.Status.BAD_REQUEST.getStatusCode(), response.getStatus());
        assertTrue(response.getEntity() instanceof ErrorResponse);
        ErrorResponse errorResponse = (ErrorResponse) response.getEntity();
        assertEquals("Registration failed", errorResponse.getError());
        assertEquals(400, errorResponse.getStatus());
    }

    @Test
    void testLogin_Success() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userService.login(anyString(), anyString())).thenReturn("jwt-token");

        // Act
        Response response = authController.login(request);

        // Assert
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        assertTrue(response.getEntity() instanceof LoginResponse);
        LoginResponse loginResponse = (LoginResponse) response.getEntity();
        assertEquals("jwt-token", loginResponse.getToken());
        verify(userService, times(1)).login("test@example.com", "password123");
    }

    @Test
    void testLogin_Exception() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userService.login(anyString(), anyString())).thenThrow(new RuntimeException("Invalid credentials"));

        // Act
        Response response = authController.login(request);

        // Assert
        assertEquals(Response.Status.UNAUTHORIZED.getStatusCode(), response.getStatus());
        assertTrue(response.getEntity() instanceof ErrorResponse);
        ErrorResponse errorResponse = (ErrorResponse) response.getEntity();
        assertEquals("Invalid credentials", errorResponse.getError());
        assertEquals(401, errorResponse.getStatus());
    }
}