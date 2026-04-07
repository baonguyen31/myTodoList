package todo.list.auth.dto.response;

import lombok.*;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
}
