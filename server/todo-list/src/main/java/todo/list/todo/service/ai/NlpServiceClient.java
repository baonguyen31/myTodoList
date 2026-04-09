package todo.list.todo.service.ai;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import todo.list.todo.dto.request.AiTaskSuggestion;
import todo.list.todo.dto.request.ChatRequest;
import todo.list.todo.dto.request.NlpRequest;
import todo.list.todo.dto.response.ChatResponse;

import java.util.List;

@RegisterRestClient(configKey = "nlp-service")
@Path("/extract")
public interface NlpServiceClient {

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    List<AiTaskSuggestion> extract(NlpRequest request);


//    @POST
//    @Path("/chat")
//    List<Object> chat(
//            ChatRequest request,
//            @HeaderParam("x-user-email") String userEmail
//    );

    @POST
    @Path("/chat")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    ChatResponse chat(
            ChatRequest request,
            @HeaderParam("x-user-email") String userEmail
    );
}