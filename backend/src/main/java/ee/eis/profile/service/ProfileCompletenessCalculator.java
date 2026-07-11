package ee.eis.profile.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * "Profiili täituvus" — a simple unweighted checklist of six user-owned fields.
 * percent = filled / 6. Also reports which items are still missing (for "vaja täita").
 */
@Component
public class ProfileCompletenessCalculator {

    /** Presence of each checklist item. */
    public record Input(
            boolean contactPerson,
            boolean bankAccount,
            boolean website,
            boolean employeeCount,
            boolean operatingAddress,
            boolean marketRegion) {}

    public record Result(int percent, List<String> missing) {}

    public Result calculate(Input in) {
        Map<String, Boolean> items = new LinkedHashMap<>();
        items.put("contactPerson", in.contactPerson());
        items.put("bankAccount", in.bankAccount());
        items.put("website", in.website());
        items.put("employeeCount", in.employeeCount());
        items.put("operatingAddress", in.operatingAddress());
        items.put("marketRegion", in.marketRegion());

        long filled = items.values().stream().filter(Boolean::booleanValue).count();
        List<String> missing = items.entrySet().stream()
                .filter(e -> !e.getValue())
                .map(Map.Entry::getKey)
                .toList();
        int percent = (int) Math.round(filled * 100.0 / items.size());
        return new Result(percent, missing);
    }
}
