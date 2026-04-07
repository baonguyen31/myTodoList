package todo.list.todo.service.ai;

import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import todo.list.todo.dto.request.AiTaskSuggestion;
import todo.list.todo.dto.request.NlpRequest;

import java.util.List;

@RegisterRestClient(configKey = "nlp-service")
@Path("/extract")
public interface NlpServiceClient {

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    List<AiTaskSuggestion> extract(NlpRequest request);
}