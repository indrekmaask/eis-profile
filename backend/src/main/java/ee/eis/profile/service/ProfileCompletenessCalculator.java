package ee.eis.profile.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * "Profiili täituvus" — measures ONLY user-managed fields (v22 flows): primary contact's
 * e-mail and phone, employee count, target markets and the website. Registry data is filled
 * automatically and does not count — an empty profile would otherwise show a misleadingly
 * high percentage.
 */
@Component
public class ProfileCompletenessCalculator {

    public record Input(
            boolean primaryContactEmail,
            boolean primaryContactPhone,
            boolean employeeCount,
            boolean marketRegion,
            boolean website) {}

    public record Result(int percent, List<String> missing) {}

    public Result calculate(Input in) {
        Map<String, Boolean> items = new LinkedHashMap<>();
        items.put("primaryContactEmail", in.primaryContactEmail());
        items.put("primaryContactPhone", in.primaryContactPhone());
        items.put("employeeCount", in.employeeCount());
        items.put("marketRegion", in.marketRegion());
        items.put("website", in.website());

        long filled = items.values().stream().filter(Boolean::booleanValue).count();
        List<String> missing = items.entrySet().stream()
                .filter(e -> !e.getValue())
                .map(Map.Entry::getKey)
                .toList();
        int percent = (int) Math.round(filled * 100.0 / items.size());
        return new Result(percent, missing);
    }
}
