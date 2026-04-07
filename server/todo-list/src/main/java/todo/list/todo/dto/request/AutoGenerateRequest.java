package todo.list.todo.dto.request;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AutoGenerateRequest {

    @NotNull
    private String source;

    @NotBlank
    private String prompt;

    @Max(10)
    @Min(1)
    private int maxTasks = 10;


}
