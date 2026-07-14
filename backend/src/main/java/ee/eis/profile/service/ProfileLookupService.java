package ee.eis.profile.service;

import ee.eis.profile.api.dto.PrefillView;
import ee.eis.profile.integration.dto.CompanyResponse;
import ee.eis.profile.integration.RegistryClient;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ProfileLookupService {

    /** User-owned fields the register cannot provide — the creation flow asks for these. */
    private static final List<String> MISSING_USER_FIELDS = List.of(
            "website", "employeeCount", "operatingAddress", "contacts", "bankAccounts",
            "targetMarkets", "operatingRegions");

    private final RegistryClient registryClient;

    public ProfileLookupService(RegistryClient registryClient) {
        this.registryClient = registryClient;
    }

    public PrefillView prefill(String registryCode) {
        CompanyResponse c = registryClient.fetchCompany(registryCode)
                .orElseThrow(() -> new ProfileNotFoundException(registryCode));
        List<PrefillView.RelatedParty> parties = c.relatedParties() == null ? List.of()
                : c.relatedParties().stream()
                    .map(rp -> new PrefillView.RelatedParty(rp.role(), rp.type(), rp.registryCode(),
                            displayName(rp), rp.ownershipPercentage()))
                    .toList();
        return new PrefillView(c.registryCode(), c.businessName(), c.legalForm(), c.emtakCode(),
                c.emtakName(), c.capitalSize(), c.address(), c.dataAsOfDate(), parties, MISSING_USER_FIELDS);
    }

    private String displayName(CompanyResponse.RelatedPartyResponse rp) {
        if (StringUtils.hasText(rp.businessName())) {
            return rp.businessName();
        }
        String name = ((rp.firstName() == null ? "" : rp.firstName()) + " "
                + (rp.lastName() == null ? "" : rp.lastName())).trim();
        return StringUtils.hasText(name) ? name : "Tundmatu";
    }
}
