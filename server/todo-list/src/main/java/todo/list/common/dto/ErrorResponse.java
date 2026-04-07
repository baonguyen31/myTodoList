package todo.list.common.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private String error;
    private int status;
}