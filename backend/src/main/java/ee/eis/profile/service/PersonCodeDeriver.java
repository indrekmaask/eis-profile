package ee.eis.profile.service;

import java.time.LocalDate;
import java.util.Optional;
import org.springframework.stereotype.Component;

/**
 * Derives the birth date from an Estonian personal code. The first digit encodes the century
 * (and sex): 1-2 → 1800s, 3-4 → 1900s, 5-6 → 2000s. Digits 2-7 are YYMMDD.
 * Read-only / "arvutatud isikukoodist" — never asked from the user.
 */
@Component
public class PersonCodeDeriver {

    public Optional<LocalDate> birthDate(String code) {
        if (code == null || !code.matches("[0-9]{11}")) {
            return Optional.empty();
        }
        int century = switch (code.charAt(0)) {
            case '1', '2' -> 1800;
            case '3', '4' -> 1900;
            case '5', '6' -> 2000;
            default -> -1;
        };
        if (century < 0) {
            return Optional.empty();
        }
        try {
            int year = century + Integer.parseInt(code.substring(1, 3));
            int month = Integer.parseInt(code.substring(3, 5));
            int day = Integer.parseInt(code.substring(5, 7));
            return Optional.of(LocalDate.of(year, month, day));
        } catch (RuntimeException e) {
            return Optional.empty();
        }
    }
}
