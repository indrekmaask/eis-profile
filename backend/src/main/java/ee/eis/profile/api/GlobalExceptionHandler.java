package ee.eis.profile.api;

import ee.eis.profile.integration.RegistryUnavailableException;
import ee.eis.profile.service.InvalidProfileDataException;
import ee.eis.profile.service.ProfileNotFoundException;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProfileNotFoundException.class)
    ProblemDetail notFound(ProfileNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(InvalidProfileDataException.class)
    ProblemDetail invalid(InvalidProfileDataException e) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid profile data");
        pd.setProperties(Map.of("errors", (List<String>) e.getErrors()));
        return pd;
    }

    @ExceptionHandler(RegistryUnavailableException.class)
    ProblemDetail registryDown(RegistryUnavailableException e) {
        // CFR-047: the register is unreachable; the stored profile stays usable.
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE,
                "Register temporarily unavailable; showing last saved data");
    }

    @ExceptionHandler(IllegalStateException.class)
    ProblemDetail conflict(IllegalStateException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
    }
}
