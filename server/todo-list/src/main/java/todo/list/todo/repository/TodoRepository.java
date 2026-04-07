package todo.list.todo.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.util.List;
import todo.list.todo.entity.Todo;
import todo.list.todo.entity.enums.PriorityEnum;
import todo.list.todo.entity.enums.StatusEnum;
import todo.list.user.entity.User;

@ApplicationScoped
public class TodoRepository implements PanacheRepository<Todo> {
    public List<Todo> findByUserWithFilters(User user, String searchText, PriorityEnum priority, Instant dueDateBefore,
            Instant dueDateAfter, Boolean completed, StatusEnum status) {
        StringBuilder query = new StringBuilder("user = ?1");
        List<Object> params = new java.util.ArrayList<>();
        params.add(user);

        if (searchText != null && !searchText.trim().isEmpty()) {
            query.append(" and lower(title) like ?").append(params.size() + 1);
            params.add("%" + searchText.toLowerCase() + "%");
        }
        if (priority != null) {
            query.append(" and priority = ?").append(params.size() + 1);
            params.add(priority);
        }
        if (dueDateBefore != null) {
            query.append(" and dueDate < ?").append(params.size() + 1);
            params.add(dueDateBefore);
        }
        if (dueDateAfter != null) {
            query.append(" and dueDate >= ?").append(params.size() + 1);
            params.add(dueDateAfter);
        }
        if (completed != null) {
            query.append(" and completed = ?").append(params.size() + 1);
            params.add(completed);
        }
        if (status != null) {
            query.append(" and status = ?").append(params.size() + 1);
            params.add(status);
        }

        return list(query.toString(), params.toArray());
    }

    public Todo findById(Long id) {
        return find("id", id).firstResult();
    }

    public Todo saveTodo(Todo todo) {
        persist(todo);

        return todo;
    }

    public Todo deleteTodo(Todo todo) {
        delete(todo);

        return todo;
    }

    public void deleteAllByUser(User user) {
        delete("user", user);
    }
}
