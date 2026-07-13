package ee.eis.profile.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.eis.profile.api.dto.AccessEntry;
import ee.eis.profile.api.dto.ProfileView;
import ee.eis.profile.api.dto.ProfileView.SourcedValue;
import ee.eis.profile.domain.CustomerProfile;
import ee.eis.profile.domain.MarketRegion;
import ee.eis.profile.integration.dto.CompanyResponse;
import ee.eis.profile.repository.AddressRepository;
import ee.eis.profile.repository.AnnualReportRepository;
import ee.eis.profile.repository.BankAccountRepository;
import ee.eis.profile.repository.ContactPersonRepository;
import ee.eis.profile.repository.CustomerProfileRepository;
import ee.eis.profile.repository.MarketRegionRepository;
import ee.eis.profile.repository.ProfileAccessRepository;
import ee.eis.profile.repository.ProfileSourceSnapshotRepository;
import ee.eis.profile.repository.RelatedPartyRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/** Read side: assembles the profile overview and the "Vali roll" access list. */
@Service
@Transactional(readOnly = true)
public class ProfileQueryService {

    private final CustomerProfileRepository profiles;
    private final ContactPersonRepository contacts;
    private final BankAccountRepository bankAccounts;
    private final AddressRepository addresses;
    private final RelatedPartyRepository relatedParties;
    private final AnnualReportRepository annualReports;
    private final MarketRegionRepository marketRegions;
    private final ProfileSourceSnapshotRepository snapshots;
    private final ProfileAccessRepository access;
    private final SnapshotExtractor snapshotExtractor;
    private final ProfileCompletenessCalculator completeness;
    private final ObjectMapper objectMapper;

    public ProfileQueryService(CustomerProfileRepository profiles, ContactPersonRepository contacts,
                               BankAccountRepository bankAccounts, AddressRepository addresses,
                               RelatedPartyRepository relatedParties, AnnualReportRepository annualReports,
                               MarketRegionRepository marketRegions, ProfileSourceSnapshotRepository snapshots,
                               ProfileAccessRepository access, SnapshotExtractor snapshotExtractor,
                               ProfileCompletenessCalculator completeness, ObjectMapper objectMapper) {
        this.profiles = profiles;
        this.contacts = contacts;
        this.bankAccounts = bankAccounts;
        this.addresses = addresses;
        this.relatedParties = relatedParties;
        this.annualReports = annualReports;
        this.marketRegions = marketRegions;
        this.snapshots = snapshots;
        this.access = access;
        this.snapshotExtractor = snapshotExtractor;
        this.completeness = completeness;
        this.objectMapper = objectMapper;
    }

    public boolean exists(String registryCode) {
        return profiles.existsByRegistryCode(registryCode);
    }

    public ProfileView getProfile(String registryCode) {
        CustomerProfile p = profiles.findByRegistryCode(registryCode)
                .orElseThrow(() -> new ProfileNotFoundException(registryCode));
        return assemble(p, List.of());
    }

    public ProfileView assemble(CustomerProfile p, List<ProfileView.Discrepancy> discrepancies) {
        UUID id = p.getId();
        var contactList = contacts.findByProfileId(id).stream()
                .map(c -> new ProfileView.Contact(c.getId().toString(), c.getFullName(), c.getRole(),
                        c.getEmail(), c.getPhone(), c.getPersonCode(), c.isPrimary(), c.getSource().name()))
                .toList();
        var bankList = bankAccounts.findByProfileId(id).stream()
                .map(b -> new ProfileView.BankAccount(b.getId().toString(), b.getIban(), b.getBankName(),
                        b.isPrimary(), b.getSource().name()))
                .toList();
        var addressList = addresses.findByProfileId(id).stream()
                .map(a -> new ProfileView.AddressView(a.getId().toString(), a.getAddressType(),
                        a.getFullAddress(), a.getSource().name()))
                .toList();
        var partyList = relatedParties.findByProfileId(id).stream()
                .map(r -> new ProfileView.RelatedParty(r.getRole(), r.getPartyType(), r.getRegistryCode(),
                        r.getDisplayName(), r.getOwnershipPct()))
                .toList();
        var reportList = annualReports.findByProfileIdOrderByReportYearDesc(id).stream()
                .map(r -> new ProfileView.AnnualReport(r.getReportYear(), r.isSubmitted(),
                        r.getSalesRevenueEstonia(), r.getSalesRevenueEu(), r.getSalesRevenueNonEu(),
                        r.getNetProfit(), r.getBalanceSheetTotal(), r.getEquity()))
                .toList();
        List<MarketRegion> regions = marketRegions.findByProfileId(id);
        var regionViews = regions.stream()
                .map(m -> new ProfileView.MarketRegionView(m.getRegionType(), m.getValue()))
                .toList();
        List<String> targetMarkets = regions.stream()
                .filter(m -> "TARGET_MARKET".equals(m.getRegionType())).map(MarketRegion::getValue).toList();
        List<String> operatingRegions = regions.stream()
                .filter(m -> "OPERATING_REGION".equals(m.getRegionType())).map(MarketRegion::getValue).toList();

        Optional<CompanyResponse> snapshot = latestSnapshot(id);
        SnapshotExtractor.Cards cards = snapshot.map(snapshotExtractor::extract)
                .orElse(new SnapshotExtractor.Cards(0, 0, "—", 0));
        String dataAsOf = snapshot.map(CompanyResponse::dataAsOfDate).orElse(null);

        var primary = contactList.stream().filter(ProfileView.Contact::primary).findFirst()
                .or(() -> contactList.stream().findFirst());
        var comp = completeness.calculate(new ProfileCompletenessCalculator.Input(
                primary.map(c -> StringUtils.hasText(c.email())).orElse(false),
                primary.map(c -> StringUtils.hasText(c.phone())).orElse(false),
                p.getEmployeeCount() != null, !regions.isEmpty(), StringUtils.hasText(p.getWebsite())));

        return new ProfileView(
                p.getRegistryCode(), p.getProfileStatus(), dataAsOf,
                sv(p.getBusinessName(), p.getBusinessNameSource()),
                sv(p.getLegalForm(), p.getLegalFormSource()),
                sv(p.getEmtakCode(), p.getEmtakSource()),
                sv(p.getEmtakName(), p.getEmtakSource()),
                sv(p.getCapitalSize(), p.getCapitalSizeSource()),
                sv(p.getWebsite(), p.getWebsiteSource()),
                sv(p.getEmployeeCount(), p.getEmployeeCountSource()),
                new ProfileView.Completeness(comp.percent(), comp.missing()),
                new ProfileView.Cards(partyList.size(), cards.realEstateCount(), cards.officialNoticeCount(),
                        cards.paymentBehaviour(), cards.totalDebt(), p.getEmployeeCount(), targetMarkets, operatingRegions),
                contactList, bankList, addressList, partyList, reportList, regionViews, discrepancies);
    }

    public List<AccessEntry> listAccessFor(String personCode) {
        return access.findByPersonCode(personCode).stream()
                .flatMap(a -> profiles.findById(a.getProfileId()).stream()
                        .map(p -> new AccessEntry(p.getRegistryCode(), p.getBusinessName(), a.getAccessRole())))
                .toList();
    }

    private Optional<CompanyResponse> latestSnapshot(UUID profileId) {
        return snapshots.findFirstByProfileIdOrderByFetchedAtDesc(profileId).map(s -> {
            try {
                return objectMapper.readValue(s.getPayload(), CompanyResponse.class);
            } catch (Exception e) {
                return null;
            }
        });
    }

    private <T> SourcedValue<T> sv(T value, ee.eis.profile.domain.Source source) {
        return new SourcedValue<>(value, source == null ? null : source.name());
    }
}
