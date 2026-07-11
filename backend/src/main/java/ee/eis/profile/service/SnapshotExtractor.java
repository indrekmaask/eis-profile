package ee.eis.profile.service;

import ee.eis.profile.integration.dto.CompanyResponse;
import org.springframework.stereotype.Component;

/**
 * Derives read-only "Muud andmed" card values from a register response (real estate, debts,
 * official notices). These are extracted from the stored JSONB snapshot, not kept as tables
 * (decision 5).
 */
@Component
public class SnapshotExtractor {

    public record Cards(int realEstateCount, int officialNoticeCount, String paymentBehaviour, long totalDebt) {}

    public Cards extract(CompanyResponse c) {
        int realEstate = c.realEstate() == null ? 0 : c.realEstate().size();
        int notices = c.officialNotices() == null ? 0 : c.officialNotices().size();
        long totalDebt = 0L;
        if (c.debts() != null) {
            totalDebt = c.debts().stream()
                    .mapToLong(d -> d.totalDebt() == null ? 0 : d.totalDebt())
                    .sum();
        }
        return new Cards(realEstate, notices, paymentBehaviour(totalDebt), totalDebt);
    }

    private String paymentBehaviour(long totalDebt) {
        if (totalDebt <= 0) {
            return "Väga hea";
        }
        if (totalDebt < 5000) {
            return "Hea";
        }
        return "Tähelepanu vajav";
    }
}
