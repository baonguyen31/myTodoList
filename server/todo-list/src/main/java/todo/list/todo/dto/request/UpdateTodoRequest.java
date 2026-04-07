package todo.list.todo.dto.request;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import todo.list.common.InstantDeserializer;
import todo.list.todo.entity.enums.PriorityEnum;
import todo.list.todo.entity.enums.StatusEnum;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.Instant;

@Data
public class UpdateTodoRequest {
    @NotBlank
    @Size(max = 100)
    @Schema(description = "title", examples = "string")
    private String title;

    @Size(max = 500)
    @Schema(description = "description", examples = "string")
    private String description;

    @Schema(description = "completed", examples = "false")
    private Boolean completed;

    @JsonDeserialize(using = InstantDeserializer.class)
    @Schema(description = "dueDate", examples = "dateTime")
    private Instant dueDate;

    @JsonProperty(defaultValue = "MEDIUM")
    @Schema(description = "priority", examples = "HIGH/MEDIUM/LOW")
    private PriorityEnum priority;

    @JsonProperty(defaultValue = "PENDING")
    @Schema(description = "status", examples = "PENDING/IN_PROGRESS/COMPLETED")
    private StatusEnum status;
}
