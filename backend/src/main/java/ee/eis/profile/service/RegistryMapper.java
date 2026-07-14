package ee.eis.profile.service;

import ee.eis.profile.domain.Address;
import ee.eis.profile.domain.AnnualReport;
import ee.eis.profile.domain.CustomerProfile;
import ee.eis.profile.domain.RelatedParty;
import ee.eis.profile.domain.Source;
import ee.eis.profile.integration.dto.CompanyResponse;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class RegistryMapper {

    public void applyRegistryFields(CustomerProfile profile, CompanyResponse c) {
        profile.setRegistryCode(c.registryCode());
        profile.setBusinessName(c.businessName());
        profile.setBusinessNameSource(Source.REGISTRY);
        profile.setLegalForm(c.legalForm());
        profile.setLegalFormSource(Source.REGISTRY);
        profile.setEmtakCode(c.emtakCode());
        profile.setEmtakName(c.emtakName());
        profile.setEmtakSource(Source.REGISTRY);
        profile.setCapitalSize(c.capitalSize());
        profile.setCapitalSizeSource(Source.REGISTRY);
        // website + employeeCount are USER-owned; the register does not provide them.
    }

    public Address toLegalAddress(java.util.UUID profileId, CompanyResponse c) {
        if (!StringUtils.hasText(c.address())) {
            return null;
        }
        Address a = new Address();
        a.setProfileId(profileId);
        a.setAddressType("LEGAL");
        a.setFullAddress(c.address());
        a.setSource(Source.REGISTRY);
        return a;
    }

    public List<RelatedParty> toRelatedParties(java.util.UUID profileId, CompanyResponse c) {
        if (c.relatedParties() == null) {
            return List.of();
        }
        return c.relatedParties().stream().map(rp -> {
            RelatedParty e = new RelatedParty();
            e.setProfileId(profileId);
            e.setRole(rp.role() != null ? rp.role() : "Seotud isik");
            e.setPartyType(normalizePartyType(rp.type()));
            e.setRegistryCode(rp.registryCode());
            e.setCountryCode(rp.countryCode());
            e.setDisplayName(displayName(rp));
            e.setOwnershipPct(rp.ownershipPercentage());
            e.setSource(Source.REGISTRY);
            return e;
        }).toList();
    }

    public List<AnnualReport> toAnnualReports(java.util.UUID profileId, CompanyResponse c) {
        if (c.annualReports() == null) {
            return List.of();
        }
        return c.annualReports().stream().map(r -> {
            AnnualReport e = new AnnualReport();
            e.setProfileId(profileId);
            e.setReportYear(r.reportYear());
            e.setRequired(Boolean.TRUE.equals(r.isRequired()));
            e.setSubmitted(Boolean.TRUE.equals(r.isSubmitted()));
            e.setSalesRevenueEstonia(r.salesRevenueEstonia());
            e.setSalesRevenueEu(r.salesRevenueEu());
            e.setSalesRevenueNonEu(r.salesRevenueNonEu());
            e.setOperatingProfit(r.operatingProfit());
            e.setNetProfit(r.netProfit());
            e.setBalanceSheetTotal(r.balanceSheetTotal());
            e.setEquity(r.equity());
            e.setSource(Source.REGISTRY);
            return e;
        }).toList();
    }

    /** The register reports party type in Estonian; normalise to the NATURAL/LEGAL enum. */
    private String normalizePartyType(String type) {
        if (type == null) {
            return null;
        }
        String t = type.toLowerCase();
        if (t.contains("füüsiline") || t.equals("natural")) {
            return "NATURAL";
        }
        if (t.contains("juriidiline") || t.equals("legal")) {
            return "LEGAL";
        }
        return null;
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
