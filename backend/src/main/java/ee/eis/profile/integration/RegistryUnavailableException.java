package ee.eis.profile.integration;

/** Raised when the register cannot be reached or returns a server error — triggers fallback (CFR-047). */
public class RegistryUnavailableException extends RuntimeException {
    public RegistryUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
