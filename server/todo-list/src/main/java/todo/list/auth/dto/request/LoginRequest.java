package todo.list.auth.dto.request;

import lombok.*;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    @NotBlank
    @Schema(description = "email", examples = "string")
    private String email;

    @NotBlank
    @Schema(description = "password", examples = "string")
    private String password;
}