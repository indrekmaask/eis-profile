package ee.eis.profile.service;

import ee.eis.profile.domain.CustomerProfile;
import ee.eis.profile.domain.Source;
import ee.eis.profile.integration.dto.CompanyResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Component;

/**
 * Flags register-owned fields whose stored value materially differs from a fresh register value,
 * so the UI can show a quiet "vaata üle" prompt. User-owned fields are never flagged.
 */
@Component
public class DiscrepancyDetector {

    public record Discrepancy(String field, String storedValue, String registryValue) {}

    public List<Discrepancy> detect(CustomerProfile stored, CompanyResponse fresh) {
        List<Discrepancy> out = new ArrayList<>();
        check(out, "businessName", stored.getBusinessNameSource(), stored.getBusinessName(), fresh.businessName());
        check(out, "legalForm", stored.getLegalFormSource(), stored.getLegalForm(), fresh.legalForm());
        check(out, "emtakCode", stored.getEmtakSource(), stored.getEmtakCode(), fresh.emtakCode());
        check(out, "capitalSize", stored.getCapitalSizeSource(),
                str(stored.getCapitalSize()), str(fresh.capitalSize()));
        return out;
    }

    private void check(List<Discrepancy> out, String field, Source source, String stored, String fresh) {
        // Only register-derived fields are candidates; a value the user owns is authoritative.
        if (source == Source.USER || fresh == null) {
            return;
        }
        if (!Objects.equals(stored, fresh)) {
            out.add(new Discrepancy(field, stored, fresh));
        }
    }

    private String str(Object o) {
        return o == null ? null : o.toString();
    }
}
