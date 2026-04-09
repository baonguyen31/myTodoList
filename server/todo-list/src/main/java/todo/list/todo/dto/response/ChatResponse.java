package todo.list.todo.dto.response;

public class ChatResponse {
    private String message;
    private String action;   // ask | confirm | save | cancel
    private ChatTaskDTO task;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public ChatTaskDTO getTask() { return task; }
    public void setTask(ChatTaskDTO task) { this.task = task; }
}