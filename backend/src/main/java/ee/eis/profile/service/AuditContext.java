package ee.eis.profile.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class AuditContext {

    public static final String ACTOR_HEADER = "X-Actor-Person";

    public String currentActor() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
            HttpServletRequest request = attrs.getRequest();
            String actor = request.getHeader(ACTOR_HEADER);
            return actor != null && !actor.isBlank() ? actor : null;
        }
        return null;
    }
}
