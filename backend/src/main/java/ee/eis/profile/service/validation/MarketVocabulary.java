package ee.eis.profile.service.validation;

import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Component;

/**
 * Controlled vocabulary for {@code market_region.value}:
 * <ul>
 *   <li>TARGET_MARKET — ISO 3166-1 alpha-2 country codes;</li>
 *   <li>OPERATING_REGION — a predefined region list.</li>
 * </ul>
 */
@Component
public class MarketVocabulary {

    private static final Set<String> COUNTRIES = Set.of(Locale.getISOCountries());

    /** Predefined operating regions (extend as needed). */
    public static final Set<String> OPERATING_REGIONS = Set.of(
            "TALLINN", "TARTU", "PARNU", "NARVA", "VILJANDI",
            "RIGA", "VILNIUS", "HELSINKI", "STOCKHOLM");

    public boolean isValid(String regionType, String value) {
        if (value == null) {
            return false;
        }
        return switch (regionType) {
            case "TARGET_MARKET" -> COUNTRIES.contains(value);
            case "OPERATING_REGION" -> OPERATING_REGIONS.contains(value);
            default -> false;
        };
    }
}
