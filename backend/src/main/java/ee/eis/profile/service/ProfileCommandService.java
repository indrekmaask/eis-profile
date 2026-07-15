package ee.eis.profile.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.eis.profile.api.dto.ProfileRequests.BankAccountInput;
import ee.eis.profile.api.dto.ProfileRequests.ContactInput;
import ee.eis.profile.api.dto.ProfileRequests.CreateProfileRequest;
import ee.eis.profile.api.dto.ProfileRequests.StepUpdateRequest;
import ee.eis.profile.api.dto.ProfileView;
import ee.eis.profile.domain.Address;
import ee.eis.profile.domain.AnnualReport;
import ee.eis.profile.domain.AuditAction;
import ee.eis.profile.domain.BankAccount;
import ee.eis.profile.domain.ContactPerson;
import ee.eis.profile.domain.CustomerProfile;
import ee.eis.profile.domain.MarketRegion;
import ee.eis.profile.domain.ProfileAccess;
import ee.eis.profile.domain.ProfileSourceSnapshot;
import ee.eis.profile.domain.Source;
import ee.eis.profile.integration.RegistryClient;
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
import ee.eis.profile.service.validation.IbanValidator;
import ee.eis.profile.service.validation.MarketVocabulary;
import ee.eis.profile.service.validation.PersonCodeValidator;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class ProfileCommandService {

    private static final String ENDPOINT = "/api/v1/companies/";

    private final CustomerProfileRepository profiles;
    private final ContactPersonRepository contacts;
    private final BankAccountRepository bankAccounts;
    private final AddressRepository addresses;
    private final RelatedPartyRepository relatedParties;
    private final AnnualReportRepository annualReports;
    private final MarketRegionRepository marketRegions;
    private final ProfileSourceSnapshotRepository snapshots;
    private final ProfileAccessRepository access;
    private final RegistryClient registryClient;
    private final RegistryMapper mapper;
    private final ValueResolver resolver;
    private final DiscrepancyDetector discrepancyDetector;
    private final IbanValidator ibanValidator;
    private final PersonCodeValidator personCodeValidator;
    private final MarketVocabulary vocabulary;
    private final ProfileQueryService queryService;
    private final ObjectMapper objectMapper;
    private final AuditService auditService;

    public ProfileCommandService(CustomerProfileRepository profiles, ContactPersonRepository contacts,
                                 BankAccountRepository bankAccounts, AddressRepository addresses,
                                 RelatedPartyRepository relatedParties, AnnualReportRepository annualReports,
                                 MarketRegionRepository marketRegions, ProfileSourceSnapshotRepository snapshots,
                                 ProfileAccessRepository access,
                                 RegistryClient registryClient, RegistryMapper mapper, ValueResolver resolver,
                                 DiscrepancyDetector discrepancyDetector, IbanValidator ibanValidator,
                                 PersonCodeValidator personCodeValidator, MarketVocabulary vocabulary,
                                 ProfileQueryService queryService, ObjectMapper objectMapper,
                                 AuditService auditService) {
        this.profiles = profiles;
        this.contacts = contacts;
        this.bankAccounts = bankAccounts;
        this.addresses = addresses;
        this.relatedParties = relatedParties;
        this.annualReports = annualReports;
        this.marketRegions = marketRegions;
        this.access = access;
        this.snapshots = snapshots;
        this.registryClient = registryClient;
        this.mapper = mapper;
        this.resolver = resolver;
        this.discrepancyDetector = discrepancyDetector;
        this.ibanValidator = ibanValidator;
        this.personCodeValidator = personCodeValidator;
        this.vocabulary = vocabulary;
        this.queryService = queryService;
        this.objectMapper = objectMapper;
        this.auditService = auditService;
    }

    public ProfileView create(CreateProfileRequest req) {
        String rc = req.registryCode();
        if (profiles.existsByRegistryCode(rc)) {
            throw new IllegalStateException("Profile already exists for " + rc);
        }
        CompanyResponse company = registryClient.fetchCompany(rc)
                .orElseThrow(() -> new ProfileNotFoundException(rc));

        validate(req.employeeCount(), req.bankAccounts(), req.contacts(), req.targetMarkets(), req.operatingRegions());

        CustomerProfile profile = new CustomerProfile();
        mapper.applyRegistryFields(profile, company);
        if (StringUtils.hasText(req.website())) {
            profile.setWebsite(req.website());
            profile.setWebsiteSource(Source.USER);
        }
        if (req.employeeCount() != null) {
            profile.setEmployeeCount(req.employeeCount());
            profile.setEmployeeCountSource(Source.USER);
        }
        if (StringUtils.hasText(req.contactEmail())) {
            profile.setContactEmail(req.contactEmail());
        }
        if (StringUtils.hasText(req.contactPhone())) {
            profile.setContactPhone(req.contactPhone());
        }
        profile.setProfileStatus("ACTIVE");
        profile = profiles.save(profile);
        UUID id = profile.getId();

        writeSnapshot(id, rc, company);

        Address legal = mapper.toLegalAddress(id, company);
        if (legal != null) {
            addresses.save(legal);
        }
        if (StringUtils.hasText(req.operatingAddress())) {
            addresses.save(operating(id, req.operatingAddress()));
        }
        relatedParties.saveAll(mapper.toRelatedParties(id, company));
        annualReports.saveAll(mapper.toAnnualReports(id, company));
        saveContacts(id, req.contacts());
        saveBankAccounts(id, req.bankAccounts());
        saveMarketRegions(id, req.targetMarkets(), req.operatingRegions());

        if (StringUtils.hasText(req.actingPersonCode())) {
            ProfileAccess owner = new ProfileAccess();
            owner.setProfileId(id);
            owner.setPersonCode(req.actingPersonCode());
            owner.setAccessRole("OWNER");
            owner.setGrantedVia("PROFILE_CREATE");
            access.save(owner);
        }

        auditService.record(AuditAction.CREATE_PROFILE, rc, req.actingPersonCode(),
                Map.of("profileStatus", profile.getProfileStatus()));
        return queryService.assemble(profiles.findById(id).orElseThrow(), List.of());
    }

    public ProfileView updateStep(String registryCode, int step, StepUpdateRequest req) {
        CustomerProfile profile = profiles.findByRegistryCode(registryCode)
                .orElseThrow(() -> new ProfileNotFoundException(registryCode));
        validate(req.employeeCount(), req.bankAccounts(), req.contacts(), req.targetMarkets(), req.operatingRegions());
        UUID id = profile.getId();

        // The wizard always sends the full set of user-owned scalars, so null/blank
        // means "cleared by the user", not "unchanged" (fields were unclearable before).
        profile.setEmployeeCount(req.employeeCount());
        profile.setEmployeeCountSource(Source.USER);
        if (req.website() != null) {
            profile.setWebsite(StringUtils.hasText(req.website()) ? req.website() : null);
            profile.setWebsiteSource(Source.USER);
        }
        if (req.contactEmail() != null) {
            profile.setContactEmail(StringUtils.hasText(req.contactEmail()) ? req.contactEmail() : null);
        }
        if (req.contactPhone() != null) {
            profile.setContactPhone(StringUtils.hasText(req.contactPhone()) ? req.contactPhone() : null);
        }
        profiles.save(profile);

        // Replace-on-update: flush deletes before inserts so unique keys don't collide in one flush.
        if (req.operatingAddress() != null) {
            addresses.findByProfileId(id).stream()
                    .filter(a -> "OPERATING".equals(a.getAddressType()))
                    .forEach(addresses::delete);
            addresses.flush();
            if (StringUtils.hasText(req.operatingAddress())) {
                addresses.save(operating(id, req.operatingAddress()));
            }
        }
        if (req.contacts() != null) {
            contacts.deleteAll(contacts.findByProfileId(id));
            contacts.flush();
            saveContacts(id, req.contacts());
        }
        if (req.bankAccounts() != null) {
            bankAccounts.deleteAll(bankAccounts.findByProfileId(id));
            bankAccounts.flush();
            saveBankAccounts(id, req.bankAccounts());
        }
        if (req.targetMarkets() != null || req.operatingRegions() != null) {
            // Scope the replace per region type: a null list means "unchanged", so its rows must survive.
            var existing = marketRegions.findByProfileId(id);
            if (req.targetMarkets() != null) {
                existing.stream().filter(m -> "TARGET_MARKET".equals(m.getRegionType()))
                        .forEach(marketRegions::delete);
            }
            if (req.operatingRegions() != null) {
                existing.stream().filter(m -> "OPERATING_REGION".equals(m.getRegionType()))
                        .forEach(marketRegions::delete);
            }
            marketRegions.flush();
            saveMarketRegions(id, req.targetMarkets(), req.operatingRegions());
        }
        auditService.record(AuditAction.UPDATE_STEP, registryCode, Map.of("step", step));
        return queryService.assemble(profiles.findById(id).orElseThrow(), List.of());
    }

    public ProfileView refresh(String registryCode) {
        CustomerProfile profile = profiles.findByRegistryCode(registryCode)
                .orElseThrow(() -> new ProfileNotFoundException(registryCode));
        // RegistryUnavailableException propagates -> 503; the stored profile stays intact (CFR-047).
        CompanyResponse fresh = registryClient.fetchCompany(registryCode)
                .orElseThrow(() -> new ProfileNotFoundException(registryCode));

        var discrepancies = discrepancyDetector.detect(profile, fresh).stream()
                .map(d -> new ProfileView.Discrepancy(d.field(), d.storedValue(), d.registryValue()))
                .toList();

        var bn = resolver.mergeRegistry(profile.getBusinessName(), profile.getBusinessNameSource(), fresh.businessName());
        profile.setBusinessName(bn.value());
        profile.setBusinessNameSource(bn.source());
        var lf = resolver.mergeRegistry(profile.getLegalForm(), profile.getLegalFormSource(), fresh.legalForm());
        profile.setLegalForm(lf.value());
        profile.setLegalFormSource(lf.source());
        var cap = resolver.mergeRegistry(profile.getCapitalSize(), profile.getCapitalSizeSource(), fresh.capitalSize());
        profile.setCapitalSize(cap.value());
        profile.setCapitalSizeSource(cap.source());
        var em = resolver.mergeRegistry(profile.getEmtakCode(), profile.getEmtakSource(), fresh.emtakCode());
        profile.setEmtakCode(em.value());
        profile.setEmtakSource(em.source());
        if (em.source() == Source.REGISTRY && fresh.emtakCode() != null) {
            profile.setEmtakName(fresh.emtakName());
        }
        profiles.save(profile);

        UUID id = profile.getId();
        // Current-state register children are replaced wholesale. Flush the deletes before
        // re-inserting so unique keys (e.g. related_party_unique) do not collide within one flush.
        relatedParties.deleteAll(relatedParties.findByProfileId(id));
        addresses.findByProfileId(id).stream()
                .filter(a -> "LEGAL".equals(a.getAddressType()))
                .forEach(addresses::delete);
        relatedParties.flush();

        relatedParties.saveAll(mapper.toRelatedParties(id, fresh));

        // Annual reports are immutable history: an already-stored year is never overwritten;
        // only report years not yet present are added.
        Set<Integer> existingYears = annualReports.findByProfileIdOrderByReportYearDesc(id).stream()
                .map(AnnualReport::getReportYear).collect(Collectors.toSet());
        annualReports.saveAll(mapper.toAnnualReports(id, fresh).stream()
                .filter(r -> !existingYears.contains(r.getReportYear())).toList());

        Address legal = mapper.toLegalAddress(id, fresh);
        if (legal != null) {
            addresses.save(legal);
        }

        writeSnapshot(id, registryCode, fresh);
        auditService.record(AuditAction.REFRESH, registryCode,
                Map.of("discrepancyFields", discrepancies.stream()
                        .map(ProfileView.Discrepancy::field).toList()));
        return queryService.assemble(profiles.findById(id).orElseThrow(), discrepancies);
    }

    private void writeSnapshot(UUID profileId, String registryCode, CompanyResponse company) {
        try {
            ProfileSourceSnapshot s = new ProfileSourceSnapshot();
            s.setProfileId(profileId);
            s.setSourceSystem("RIK");
            s.setEndpoint(ENDPOINT + registryCode);
            s.setPayload(objectMapper.writeValueAsString(company));
            snapshots.save(s);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialise register snapshot", e);
        }
    }

    private void validate(Integer employeeCount, List<BankAccountInput> banks, List<ContactInput> contactInputs,
                          List<String> targetMarkets, List<String> operatingRegions) {
        List<String> errors = new ArrayList<>();
        if (employeeCount != null && employeeCount < 0) {
            errors.add("Employee count must not be negative");
        }
        if (banks != null) {
            Set<String> seenIbans = new HashSet<>();
            for (BankAccountInput b : banks) {
                if (!ibanValidator.isValid(b.iban())) {
                    errors.add("Invalid IBAN: " + b.iban());
                } else if (!seenIbans.add(b.iban().replace(" ", "").toUpperCase())) {
                    errors.add("Duplicate IBAN: " + b.iban());
                }
            }
        }
        if (contactInputs != null) {
            Set<String> seenCodes = new HashSet<>();
            for (ContactInput c : contactInputs) {
                if (StringUtils.hasText(c.personCode()) && !personCodeValidator.isValid(c.personCode())) {
                    errors.add("Invalid person code: " + c.personCode());
                } else if (StringUtils.hasText(c.personCode()) && !seenCodes.add(c.personCode())) {
                    errors.add("Duplicate contact person code: " + c.personCode());
                }
            }
        }
        if (targetMarkets != null) {
            for (String m : targetMarkets) {
                if (!vocabulary.isValid("TARGET_MARKET", m)) {
                    errors.add("Unknown target market: " + m);
                }
            }
        }
        if (operatingRegions != null) {
            for (String r : operatingRegions) {
                if (!vocabulary.isValid("OPERATING_REGION", r)) {
                    errors.add("Unknown operating region: " + r);
                }
            }
        }
        if (!errors.isEmpty()) {
            throw new InvalidProfileDataException(errors);
        }
    }

    private Address operating(UUID profileId, String fullAddress) {
        Address a = new Address();
        a.setProfileId(profileId);
        a.setAddressType("OPERATING");
        a.setFullAddress(fullAddress);
        a.setSource(Source.USER);
        return a;
    }

    private void saveContacts(UUID profileId, List<ContactInput> inputs) {
        if (inputs == null) {
            return;
        }
        for (ContactInput c : inputs) {
            ContactPerson e = new ContactPerson();
            e.setProfileId(profileId);
            e.setFullName(c.fullName());
            e.setRole(c.role());
            e.setEmail(c.email());
            e.setPhone(c.phone());
            e.setPersonCode(c.personCode());
            e.setPrimary(c.primary());
            e.setSource(Source.USER);
            contacts.save(e);
        }
    }

    private void saveBankAccounts(UUID profileId, List<BankAccountInput> inputs) {
        if (inputs == null) {
            return;
        }
        for (BankAccountInput b : inputs) {
            BankAccount e = new BankAccount();
            e.setProfileId(profileId);
            e.setIban(b.iban().replace(" ", "").toUpperCase());
            e.setBankName(b.bankName());
            e.setPrimary(b.primary());
            e.setSource(Source.USER);
            bankAccounts.save(e);
        }
    }

    private void saveMarketRegions(UUID profileId, List<String> targetMarkets, List<String> operatingRegions) {
        if (targetMarkets != null) {
            for (String m : targetMarkets) {
                marketRegions.save(marketRegion(profileId, "TARGET_MARKET", m));
            }
        }
        if (operatingRegions != null) {
            for (String r : operatingRegions) {
                marketRegions.save(marketRegion(profileId, "OPERATING_REGION", r));
            }
        }
    }

    private MarketRegion marketRegion(UUID profileId, String type, String value) {
        MarketRegion m = new MarketRegion();
        m.setProfileId(profileId);
        m.setRegionType(type);
        m.setValue(value);
        m.setSource(Source.USER);
        return m;
    }
}
