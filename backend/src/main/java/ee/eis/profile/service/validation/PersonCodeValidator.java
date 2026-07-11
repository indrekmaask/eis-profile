package ee.eis.profile.service.validation;

import org.springframework.stereotype.Component;

/** Validates Estonian personal identification codes (11 digits, control-digit checksum). */
@Component
public class PersonCodeValidator {

    private static final int[] W1 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 1};
    private static final int[] W2 = {3, 4, 5, 6, 7, 8, 9, 1, 2, 3};

    public boolean isValid(String code) {
        if (code == null || !code.matches("[0-9]{11}")) {
            return false;
        }
        int expected = controlDigit(code);
        return expected == (code.charAt(10) - '0');
    }

    private int controlDigit(String code) {
        int sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += (code.charAt(i) - '0') * W1[i];
        }
        int mod = sum % 11;
        if (mod < 10) {
            return mod;
        }
        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += (code.charAt(i) - '0') * W2[i];
        }
        mod = sum % 11;
        return mod < 10 ? mod : 0;
    }
}
