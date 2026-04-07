package todo.list.common.security;

import at.favre.lib.crypto.bcrypt.BCrypt;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PasswordEncoder {
    public String hash(String rawPassword) {
        return BCrypt.withDefaults().hashToString(12, rawPassword.toCharArray());
    }

    public boolean verifyPassword(String rawPassword, String hash) {
        return BCrypt.verifyer().verify(rawPassword.toCharArray(), hash).verified;
    }
}
