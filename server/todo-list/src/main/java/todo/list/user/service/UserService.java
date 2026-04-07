package todo.list.user.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Optional;
import todo.list.common.security.JwtGenerator;
import todo.list.common.security.PasswordEncoder;
import todo.list.user.entity.User;
import todo.list.user.repository.UserRepository;

@ApplicationScoped
public class UserService {
    @Inject
    UserRepository userRepository;

    @Inject
    PasswordEncoder passwordEncoder;

    @Inject
    JwtGenerator jwtGenerator;

    // REPOSITORY METHODS FOR REUSING
    public Optional<User> findByEmail(String email) {
        return Optional.ofNullable(userRepository.findByEmail(email));
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User saveUser(User user) {
        return userRepository.saveUser(user);
    }

    @Transactional
    public String loginOrRegisterSocial(String email, String name, String avatar) throws Exception {
        Optional<User> existingUser = findByEmail(email);
        
        if (existingUser.isPresent())
            return jwtGenerator.generateToken(existingUser.get().email);

        User newUser = new User();
        newUser.email = email;
        newUser.passwordHash = passwordEncoder.hash(java.util.UUID.randomUUID().toString());
        newUser.active = true;
        newUser.createdAt = java.time.Instant.now();

        saveUser(newUser);

        return jwtGenerator.generateToken(newUser.email);
    }

    // SERVICE METHODS
    @Transactional
    public User register(String email, String password) throws Exception {
        if (existsByEmail(email))
            throw new Exception("Email already exists");

        if (password.length() < 10)
            throw new Exception("Password must be at least 10 characters long");

        User user = new User();
        user.email = email;
        user.passwordHash = passwordEncoder.hash(password);

        return saveUser(user);
    }

    public String login(String email, String password) throws Exception {
        User found = findByEmail(email).orElseThrow(() -> new Exception("User not found!"));

        if (!found.active)
            throw new Exception("Account is inactive!");

        if (!passwordEncoder.verifyPassword(password, found.passwordHash))
            throw new Exception("Invalid credentials!");

        String token = jwtGenerator.generateToken(found.email);

        return token;
    }
}
