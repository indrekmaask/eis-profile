package ee.eis.profile.api.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Register data for the Scenario-2 creation flow: everything the register can pre-fill,
 * so the UI only asks for the missing USER fields.
 */
public record PrefillView(
        String registryCode,
        String businessName,
        String legalForm,
        String emtakCode,
        String emtakName,
        Long capitalSize,
        String legalAddress,
        String dataAsOfDate,
        List<RelatedParty> relatedParties,
        List<String> missingUserFields) {

    public record RelatedParty(String role, String partyType, String registryCode,
                               String displayName, BigDecimal ownershipPct) {}
}
