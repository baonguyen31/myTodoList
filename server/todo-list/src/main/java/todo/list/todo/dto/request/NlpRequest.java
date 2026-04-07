package todo.list.todo.dto.request;

public class NlpRequest {
    private String prompt;
    private int maxTasks;

    public NlpRequest(String prompt, int maxTasks) {
        this.prompt = prompt;
        this.maxTasks = maxTasks;
    }

    public String getPrompt() { return prompt; }
    public int getMaxTasks() { return maxTasks; }
}