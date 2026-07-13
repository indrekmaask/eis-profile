package ee.eis.profile.service.validation;

import java.time.LocalDate;
import org.springframework.stereotype.Component;

/**
 * Validates Estonian personal identification codes: 11 digits, a known century/sex digit and a
 * derivable birth date. The control-digit checksum is deliberately NOT enforced — the mock API's
 * test person codes (e.g. Karel Karu 38502020023) do not pass it.
 */
@Component
public class PersonCodeValidator {

    public boolean isValid(String code) {
        if (code == null || !code.matches("[1-6][0-9]{10}")) {
            return false;
        }
        int century = switch (code.charAt(0)) {
            case '1', '2' -> 1800;
            case '3', '4' -> 1900;
            default -> 2000;
        };
        try {
            LocalDate.of(
                    century + Integer.parseInt(code.substring(1, 3)),
                    Integer.parseInt(code.substring(3, 5)),
                    Integer.parseInt(code.substring(5, 7)));
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }
}