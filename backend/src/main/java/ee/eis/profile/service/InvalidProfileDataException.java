package ee.eis.profile.service;

import java.util.List;

public class InvalidProfileDataException extends RuntimeException {
    private final List<String> errors;

    public InvalidProfileDataException(List<String> errors) {
        super("Invalid profile data: " + String.join("; ", errors));
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
