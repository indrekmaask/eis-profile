package ee.eis.profile.service.validation;

import java.math.BigInteger;
import org.springframework.stereotype.Component;

/** IBAN structural + mod-97 checksum validation (ISO 13616). */
@Component
public class IbanValidator {

    public boolean isValid(String rawIban) {
        if (rawIban == null) {
            return false;
        }
        String iban = rawIban.replace(" ", "").toUpperCase();
        if (!iban.matches("[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}")) {
            return false;
        }
        // Move the first four chars to the end.
        String rearranged = iban.substring(4) + iban.substring(0, 4);
        StringBuilder numeric = new StringBuilder();
        for (char c : rearranged.toCharArray()) {
            numeric.append(Character.isLetter(c) ? Integer.toString(c - 'A' + 10) : c);
        }
        return new BigInteger(numeric.toString()).mod(BigInteger.valueOf(97)).intValue() == 1;
    }
}
