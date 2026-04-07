package todo.list.user.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import todo.list.user.entity.User;

@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {
    public User findByEmail(String email) {
        return find("email", email).firstResult();
    }

    public boolean existsByEmail(String email) {
        return count("email", email) > 0;
    }

    public User saveUser(User user) {
        persist(user);

        return user;
    }
}
