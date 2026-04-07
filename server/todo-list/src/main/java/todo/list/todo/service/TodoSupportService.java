package todo.list.todo.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.Instant;
import todo.list.todo.dto.response.TodoResponse;
import todo.list.todo.entity.Todo;
import todo.list.todo.entity.enums.PriorityEnum;
import todo.list.todo.entity.enums.StatusEnum;
import todo.list.user.entity.User;
import todo.list.user.service.UserService;

@ApplicationScoped
public class TodoSupportService {
    @Inject
    UserService userService;

    @Inject
    TodoService todoService;

    // PRIVATE METHOD TO COMPUTE STATUS
    public StatusEnum computeStatus(Todo todo) {
        if (todo.completed) {
            return StatusEnum.COMPLETED;
        } else if (todo.isOverdue()) {
            return StatusEnum.OVERDUE;
        } else {
            return todo.status != null ? todo.status : StatusEnum.PENDING;
        }
    }

    // METHOD RETURNS TodoResponse OBJECT
    public TodoResponse mapTodoResponse(Todo todo) {
        StatusEnum computedStatus = computeStatus(todo);
        boolean completedFlag = todo.completed || computedStatus == StatusEnum.COMPLETED;

        return new TodoResponse(todo.id, todo.title, todo.description, completedFlag, todo.dueDate, todo.priority,
                computedStatus, todo.createdAt, todo.updatedAt);
    }

    // METHOD TO SET FIELDS FOR ENTITY
    public void setTodoFields(Todo todo, String title, String description, Instant dueDate,
            PriorityEnum priority,
            StatusEnum status) {
        todo.title = title.trim();
        todo.description = description != null ? description.trim() : null;
        todo.dueDate = dueDate;
        todo.priority = priority;
        todo.status = status;

        // Ensure completed flag follows status
        if (status != null)
            todo.completed = status == StatusEnum.COMPLETED;

    }

    // METHOD TO VALIDATE INPUT FIELDS
    public void validateAndPrepareTodo(String title, PriorityEnum priority, StatusEnum status) throws Exception {
        if (title.length() > 100)
            throw new Exception("Title cannot be longer than 100 characters");
    }

    // METHOD TO FIND USER BY EMAIL
    public User findUserByEmail(String email) throws Exception {
        return userService.findByEmail(email).orElseThrow(() -> new Exception("User not found"));
    }

    // METHOD TO FIND BY ID AND USER
    public Todo findTodoByIdAndUser(String userEmail, Long id) throws Exception {
        User user = findUserByEmail(userEmail);

        return todoService.findById(id).filter(t -> t.user.equals(user))
                .orElseThrow(() -> new Exception("Todo not found"));
    }
}