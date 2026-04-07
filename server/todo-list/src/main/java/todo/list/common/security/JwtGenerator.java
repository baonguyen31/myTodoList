package todo.list.common.security;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.Duration;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class JwtGenerator {
    @ConfigProperty(name = "mp.jwt.verify.issuer", defaultValue = "todo-app")
    String issuer;

    public String generateToken(String email) {
        String token = Jwt.issuer(issuer)
                .subject(email).groups("User")
                .expiresIn(Duration.ofHours(24)).sign();

        return token;
    }
}