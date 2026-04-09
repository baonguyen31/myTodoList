package todo.list.todo.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ChatTaskDTO {
    private String title;
    private String dueDate;
    private String priority;
    private String description;

    @JsonProperty("ai_generated")
    private boolean aiGenerated;
    private String source;

    // getters + setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isAiGenerated() { return aiGenerated; }
    public void setAiGenerated(boolean aiGenerated) { this.aiGenerated = aiGenerated; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}