package todo.list.todo.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import todo.list.user.entity.User;
import java.time.Instant;
import todo.list.todo.entity.enums.PriorityEnum;
import todo.list.todo.entity.enums.StatusEnum;

@Entity
@Table(name = "todos")
public class Todo extends PanacheEntity {
    @Column(nullable = false)
    public String title;

    @Column(length = 500)
    public String description;

    @Column(nullable = false)
    public boolean completed = false;

    @Column
    public Instant dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public PriorityEnum priority = PriorityEnum.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public StatusEnum status = StatusEnum.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Column(nullable = false)
    public Instant createdAt = Instant.now();

    @Column
    public Instant updatedAt;

    public boolean isOverdue() {
        return dueDate != null && dueDate.isBefore(Instant.now()) && !completed;
    }
}
