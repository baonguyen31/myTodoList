package todo.list.todo.controller;


import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import todo.list.common.dto.ErrorResponse;
import todo.list.todo.dto.request.AutoGenerateRequest;
import todo.list.todo.dto.response.TodoResponse;
import todo.list.todo.service.AutoGenerateTodoService;

import java.util.List;

@Path("/todos/auto-generate")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("User")
public class AutoGenerateController {

    @Inject
    AutoGenerateTodoService autoGenerateService;

    @Inject
    JsonWebToken jwt;

    @POST
    public Response autoGenerate(@Valid AutoGenerateRequest request) {
        try {
            String userEmail = jwt.getSubject();
            List<TodoResponse> result = autoGenerateService.autoGenerate(request, userEmail);
            return Response.ok(result).build();
        }
        catch (Exception e){
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage(), Response.Status.BAD_REQUEST.getStatusCode()))
                    .build();
        }
    }

}
