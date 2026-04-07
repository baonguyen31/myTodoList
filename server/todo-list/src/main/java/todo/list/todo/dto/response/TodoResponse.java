package todo.list.todo.dto.response;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import lombok.*;
import todo.list.todo.entity.enums.PriorityEnum;
import todo.list.todo.entity.enums.StatusEnum;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TodoResponse {
    @Schema(description = "id")
    private Long id;

    @Schema(description = "title")
    private String title;

    @Schema(description = "description")
    private String description;

    @Schema(description = "completed")
    private Boolean completed;

    @Schema(description = "dueDate")
    private Instant dueDate;

    @Schema(description = "priority")
    private PriorityEnum priority;

    @Schema(description = "status")
    private StatusEnum status;

    @Schema(description = "createdAt")
    private Instant createdAt;

    @Schema(description = "updatedAt")
    private Instant updatedAt;
}
