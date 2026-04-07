package todo.list.todo.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import todo.list.todo.dto.request.CreateTodoRequest;
import todo.list.todo.dto.request.UpdateTodoRequest;
import todo.list.todo.dto.response.TodoResponse;
import todo.list.todo.entity.Todo;
import todo.list.todo.entity.enums.PriorityEnum;
import todo.list.todo.entity.enums.StatusEnum;
import todo.list.todo.repository.TodoRepository;
import todo.list.user.entity.User;
import todo.list.user.service.UserService;

@ApplicationScoped
public class TodoService {
    @Inject
    TodoRepository todoRepository;

    @Inject
    UserService userService;

    @Inject
    TodoSupportService todoSupportService;

    // REPOSITORY METHODS FOR REUSING
    public Optional<Todo> findById(long id) {
        return Optional.ofNullable(todoRepository.findById(id));
    }

    public List<Todo> findByUserWithFilters(User user, String searchText, PriorityEnum priority, Instant dueDateBefore,
            Instant dueDateAfter, Boolean completed, StatusEnum status) {
        return todoRepository.findByUserWithFilters(user, searchText, priority, dueDateBefore, dueDateAfter, completed,
                status);
    }

    public Todo saveTodo(Todo todo) {
        return todoRepository.saveTodo(todo);
    }

    public Todo deleteTodo(Todo todo) {
        return todoRepository.deleteTodo(todo);
    }

    public void deleteAllByUser(User user) {
        todoRepository.deleteAllByUser(user);
    }

    // SERVICE METHODS
    public List<TodoResponse> getTodos(String userEmail, Boolean completed, String searchText, String priority,
            String status, Instant dueDateBefore, Integer limit, Integer offset)
            throws Exception {
        User user = todoSupportService.findUserByEmail(userEmail);
        // Normalize status value
        StatusEnum statusEnum = null;

        if (status != null && !status.trim().isEmpty()) {
            String normalizedStatus = status.trim().toLowerCase().replace('_', '-');

            if ("my-tasks".equals(normalizedStatus)) {
                statusEnum = null;
            } else {
                try {
                    statusEnum = StatusEnum.valueOf(normalizedStatus.toUpperCase().replace('-', '_'));
                } catch (IllegalArgumentException e) {
                    throw new Exception("Invalid status value: " + status);
                }
            }
        }
        // Overdue means dueDate before now and not completed
        if (statusEnum == StatusEnum.OVERDUE) {
            dueDateBefore = Instant.now();
            completed = false;
            statusEnum = null; // avoid filtering 'status' db column
        }
        // Completed/InProgress/Pending mapping (for directly persisted status column)
        Instant dueDateAfter = null;

        if (statusEnum != null) {
            if (statusEnum == StatusEnum.COMPLETED) {
                // Keep status filter for COMPLETED tasks; ignore completed flag to include old
                // data with status=COMPLETED.
                completed = null;
                dueDateAfter = null;
            } else if (statusEnum == StatusEnum.IN_PROGRESS) {
                completed = false;
                dueDateAfter = Instant.now(); // prevent overdue from appearing in in-progress
            } else if (statusEnum == StatusEnum.PENDING) {
                completed = false;
                dueDateAfter = Instant.now(); // future/pending tasks only
            }
        }

        PriorityEnum priorityEnum = null;
        if (priority != null && !priority.trim().isEmpty()) {
            try {
                priorityEnum = PriorityEnum.valueOf(priority.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new Exception("Invalid priority value: " + priority);
            }
        }

        List<Todo> todosOfUser = findByUserWithFilters(user, searchText, priorityEnum, dueDateBefore, dueDateAfter,
                completed, statusEnum);

        // Order by updatedAt desc (most recently edited first), fallback to createdAt
        // desc for never-updated tasks
        todosOfUser.sort((a, b) -> {
            Instant aOrder = a.updatedAt != null ? a.updatedAt : a.createdAt;
            Instant bOrder = b.updatedAt != null ? b.updatedAt : b.createdAt;

            return bOrder.compareTo(aOrder);
        });

        // Apply pagination if provided
        if (limit != null && offset != null) {
            int start = Math.min(offset, todosOfUser.size());
            int end = Math.min(start + limit, todosOfUser.size());

            todosOfUser = todosOfUser.subList(start, end);
        }

        List<TodoResponse> todoList = new ArrayList<>();
        for (Todo todo : todosOfUser)
            todoList.add(todoSupportService.mapTodoResponse(todo));

        return todoList;
    }

    public TodoResponse getTodoById(String userEmail, Long id) throws Exception {
        Todo todo = todoSupportService.findTodoByIdAndUser(userEmail, id);

        return todoSupportService.mapTodoResponse(todo);
    }

    @Transactional
    public TodoResponse createTodo(String userEmail, CreateTodoRequest request) throws Exception {
        todoSupportService.validateAndPrepareTodo(request.getTitle(), request.getPriority(), request.getStatus());

        User user = todoSupportService.findUserByEmail(userEmail);

        Todo todo = new Todo();
        todo.user = user;

        PriorityEnum priorityEnum = request.getPriority() != null ? request.getPriority() : PriorityEnum.MEDIUM;
        StatusEnum statusEnum = request.getStatus() != null ? request.getStatus() : StatusEnum.PENDING;

        todoSupportService.setTodoFields(todo, request.getTitle(), request.getDescription(), request.getDueDate(),
                priorityEnum, statusEnum);

        saveTodo(todo);

        return todoSupportService.mapTodoResponse(todo);
    }

    @Transactional
    public TodoResponse updateTodo(String userEmail, Long id, UpdateTodoRequest request) throws Exception {
        todoSupportService.validateAndPrepareTodo(request.getTitle(), request.getPriority(), request.getStatus());

        Todo todo = todoSupportService.findTodoByIdAndUser(userEmail, id);
        todo.updatedAt = Instant.now();

        todoSupportService.setTodoFields(todo, request.getTitle(), request.getDescription(), request.getDueDate(),
                request.getPriority(),
                request.getStatus());

        if (request.getCompleted() != null)
            todo.completed = request.getCompleted();

        return todoSupportService.mapTodoResponse(todo);
    }

    @Transactional
    public void deleteTodo(String userEmail, Long id) throws Exception {
        Todo todo = todoSupportService.findTodoByIdAndUser(userEmail, id);

        deleteTodo(todo);
    }

    @Transactional
    public void deleteAllTodos(String userEmail) throws Exception {
        User user = userService.findByEmail(userEmail).orElseThrow(() -> new Exception("User not found"));

        deleteAllByUser(user);
    }
}
