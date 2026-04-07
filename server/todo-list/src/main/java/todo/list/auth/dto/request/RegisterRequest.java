package todo.list.auth.dto.request;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
public class RegisterRequest {
    @Email
    @NotBlank
    @Schema(description = "email", examples = "string")
    private String email;

    @NotBlank
    @Schema(description = "password", examples = "string")
    private String password;
}
