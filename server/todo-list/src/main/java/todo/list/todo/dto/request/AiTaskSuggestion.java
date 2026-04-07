package todo.list.todo.dto.request;

import lombok.Getter;
import lombok.Setter;
import todo.list.todo.entity.enums.PriorityEnum;
import java.time.Instant;

@Getter
@Setter
public class AiTaskSuggestion {
    private String title;
    private String description;
    private String dueDate;
    private PriorityEnum priority;




}

