package todo.list.todo.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import todo.list.common.dto.ErrorResponse;
import todo.list.todo.dto.request.ChatRequest;
import todo.list.todo.dto.response.ChatResponse;
import todo.list.todo.dto.response.ChatTaskDTO;
import todo.list.todo.entity.Todo;
import todo.list.todo.entity.enums.PriorityEnum;
import todo.list.todo.entity.enums.StatusEnum;
import todo.list.todo.service.TodoSupportService;
import todo.list.todo.service.ai.NlpServiceClient;
import todo.list.user.entity.User;

import java.time.Instant;

@Path("/todos/chat")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("User")
public class ChatController {

    @Inject
    @RestClient
    NlpServiceClient nlpClient;

    @Inject
    JsonWebToken jwt;

    @Inject
    TodoSupportService todoSupportService;

    @POST
    @Transactional
    public Response chat(@Valid ChatRequest request) {
        try {
            String userEmail = jwt.getSubject();

            // Gọi FastAPI chatbot
            ChatResponse chatResponse = nlpClient.chat(request, userEmail);

            // Nếu action = save → lưu task vào DB
            if ("save".equals(chatResponse.getAction())
                    && chatResponse.getTask() != null) {

                Todo saved = saveTaskFromChat(chatResponse.getTask(), userEmail);
                // trả về TodoResponse chuẩn kèm message AI
                todo.list.todo.dto.response.TodoResponse todoResponse =
                        todoSupportService.mapTodoResponse(saved);

                return Response.ok(new SavedChatResponse(
                        chatResponse.getMessage(),
                        chatResponse.getAction(),
                        todoResponse
                )).build();
            }

            // Các action khác (ask, confirm, cancel) → trả nguyên response
            return Response.ok(chatResponse).build();

        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(
                            e.getMessage(),
                            Response.Status.BAD_REQUEST.getStatusCode()
                    ))
                    .build();
        }
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private Todo saveTaskFromChat(ChatTaskDTO dto, String userEmail) throws Exception {
        User user = todoSupportService.findUserByEmail(userEmail);

        Todo todo = new Todo();
        todo.user        = user;
        todo.aiGenerated = true;
        todo.source      = "chatbot";

        PriorityEnum priority = parsePriority(dto.getPriority());
        Instant dueDate       = parseDueDate(dto.getDueDate());

        todoSupportService.setTodoFields(
                todo,
                dto.getTitle(),
                dto.getDescription(),
                dueDate,
                priority,
                StatusEnum.PENDING
        );

        todo.persist();
        return todo;
    }

    private PriorityEnum parsePriority(String raw) {
        try {
            return PriorityEnum.valueOf(raw.toUpperCase());
        } catch (Exception e) {
            return PriorityEnum.MEDIUM;
        }
    }

    private Instant parseDueDate(String iso) {
        try {
            // FastAPI trả "2026-04-09T07:00:00" không có Z → thêm Z
            if (iso != null && !iso.endsWith("Z")) iso += "Z";
            return Instant.parse(iso);
        } catch (Exception e) {
            return Instant.now().plusSeconds(86400); // default: ngày mai
        }
    }

    // ── inner class để wrap response khi action=save ──────────────────────────
    public static class SavedChatResponse {
        public String message;
        public String action;
        public Object task;

        public SavedChatResponse(String message, String action, Object task) {
            this.message = message;
            this.action  = action;
            this.task    = task;
        }
    }
}