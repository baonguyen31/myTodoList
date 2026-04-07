package todo.list.todo.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.Instant;
import java.util.List;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.ExampleObject;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import todo.list.common.InstantDeserializer;
import todo.list.common.dto.ErrorResponse;
import todo.list.common.dto.MessageResponse;
import todo.list.todo.dto.request.CreateTodoRequest;
import todo.list.todo.dto.request.UpdateTodoRequest;
import todo.list.todo.dto.response.TodoResponse;
import todo.list.todo.service.TodoService;

@Path("/todos")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("User")
public class TodoController {
    @Inject
    TodoService todoService;

    @Inject
    JsonWebToken jwt;

    // API RESPONSE EXAMPLE STRINGS
    private static final String TODO_RESPONSE_EXAMPLE = "{\n" +
            "  \"id\": 1,\n" +
            "  \"title\": \"string\",\n" +
            "  \"description\": \"string\",\n" +
            "  \"completed\": false,\n" +
            "  \"dueDate\": \"dateTime\",\n" +
            "  \"priority\": \"string\",\n" +
            "  \"status\": \"string\",\n" +
            "  \"createdAt\": \"dateTime\",\n" +
            "  \"updatedAt\": \"dateTime\"\n" +
            "}";

    @POST
    @APIResponse(responseCode = "200", description = "Todo created successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "CreateTodoResponse Example", value = TODO_RESPONSE_EXAMPLE)))
    public Response createTodo(@Valid CreateTodoRequest request) {
        try {
            String userEmail = jwt.getSubject();
            TodoResponse response = todoService.createTodo(userEmail, request);

            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage(), Response.Status.BAD_REQUEST.getStatusCode()))
                    .build();
        }
    }

    @GET
    @APIResponse(responseCode = "200", description = "List of todos retrieved successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "GetTodosResponse Example", value = TODO_RESPONSE_EXAMPLE)))
    public Response getTodos(@QueryParam("completed") Boolean completed, @QueryParam("searchText") String searchText,
            @QueryParam("priority") String priority, @QueryParam("status") String status,
            @QueryParam("dueDateBefore") String dueDateBeforeStr,
            @QueryParam("limit") Integer limit, @QueryParam("offset") Integer offset) {
        try {
            String userEmail = jwt.getSubject();
            Instant dueDateBefore = InstantDeserializer.parseInstant(dueDateBeforeStr);
            List<TodoResponse> todos = todoService.getTodos(userEmail, completed, searchText, priority, status,
                    dueDateBefore,
                    limit, offset);

            return Response.ok(todos).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage(), Response.Status.BAD_REQUEST.getStatusCode()))
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    @APIResponse(responseCode = "200", description = "Get todo by id successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "GetTodoById Example", value = TODO_RESPONSE_EXAMPLE)))
    public Response getTodo(@PathParam("id") Long id) {
        try {
            String userEmail = jwt.getSubject();
            TodoResponse response = todoService.getTodoById(userEmail, id);

            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage(), Response.Status.NOT_FOUND.getStatusCode()))
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    @APIResponse(responseCode = "200", description = "Todo updated successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "UpdateTodoResponse Example", value = TODO_RESPONSE_EXAMPLE)))
    public Response updateTodo(@PathParam("id") Long id, @Valid UpdateTodoRequest request) {
        try {
            String userEmail = jwt.getSubject();
            TodoResponse response = todoService.updateTodo(userEmail, id, request);

            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage(), Response.Status.BAD_REQUEST.getStatusCode()))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @APIResponse(responseCode = "200", description = "Todo deleted successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "DeleteTodoResponse Example", value = "{\n"
            +
            "  \"message\": \"Todo deleted successfully!\"\n" +
            "}")))
    public Response deleteTodo(@PathParam("id") Long id) {
        try {
            String userEmail = jwt.getSubject();
            todoService.deleteTodo(userEmail, id);

            return Response.ok().entity(new MessageResponse("Todo deleted successfully!")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage(), Response.Status.BAD_REQUEST.getStatusCode()))
                    .build();
        }
    }

    @DELETE
    @APIResponse(responseCode = "200", description = "All todos deleted successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "DeleteAllTodosResponse Example", value = "{\n"
            +
            "  \"message\": \"All todos deleted successfully!\"\n" +
            "}")))
    public Response deleteAllTodos() {
        try {
            String userEmail = jwt.getSubject();
            todoService.deleteAllTodos(userEmail);

            return Response.ok().entity(new MessageResponse("All todos deleted successfully!")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage(), Response.Status.BAD_REQUEST.getStatusCode()))
                    .build();
        }
    }
}