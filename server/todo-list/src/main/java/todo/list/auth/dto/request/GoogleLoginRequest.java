package todo.list.auth.dto.request;

import lombok.Data;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Data
public class GoogleLoginRequest {
    @Schema(description = "Access token from Google OAuth2")
    private String accessToken;
}
