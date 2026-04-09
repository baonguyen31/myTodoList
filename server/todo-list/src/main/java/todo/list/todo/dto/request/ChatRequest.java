package todo.list.todo.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRequest {
    private String prompt;

    // ID phiên chat để giữ context hội thoại (Multi-turn)
    // Có thể dùng chính userEmail hoặc một UUID tạo từ Frontend
    private String sessionId;
}
