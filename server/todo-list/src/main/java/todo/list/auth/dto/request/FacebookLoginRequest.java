package todo.list.auth.dto.request;

import lombok.Data;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Data
public class FacebookLoginRequest {
    @NotBlank
    @Schema(description = "Access token from Facebook OAuth2")
    private String accessToken;

    @NotBlank
    @Schema(description = "Facebook user ID returned by login flow")
    private String userId;
}
