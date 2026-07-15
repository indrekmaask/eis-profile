package ee.eis.profile.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * "Profiili täituvus" — tracks ONLY user-managed fields (v22 flows): primary contact's
 * e-mail and phone, employee count, target markets and the website. Registry data is filled
 * automatically and does not count.
 */
@Component
public class ProfileCompletenessCalculator {

    public record Input(
            boolean contactEmail,
            boolean contactPhone,
            boolean employeeCount,
            boolean website) {}

    public record Result(List<String> missing) {}

    public Result calculate(Input in) {
        Map<String, Boolean> items = new LinkedHashMap<>();
        items.put("contactEmail", in.contactEmail());
        items.put("contactPhone", in.contactPhone());
        items.put("employeeCount", in.employeeCount());
        items.put("website", in.website());

        List<String> missing = items.entrySet().stream()
                .filter(e -> !e.getValue())
                .map(Map.Entry::getKey)
                .toList();
        return new Result(missing);
    }
}
