package ee.eis.profile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ee.eis.profile.domain.Address;
import ee.eis.profile.domain.ContactPerson;
import ee.eis.profile.domain.CustomerProfile;
import ee.eis.profile.domain.Source;
import ee.eis.profile.repository.AddressRepository;
import ee.eis.profile.repository.AnnualReportRepository;
import ee.eis.profile.repository.BankAccountRepository;
import ee.eis.profile.repository.ContactPersonRepository;
import ee.eis.profile.repository.CustomerProfileRepository;
import ee.eis.profile.repository.MarketRegionRepository;
import ee.eis.profile.repository.ProfileAccessRepository;
import ee.eis.profile.repository.RelatedPartyRepository;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Verifies migrations apply on PostgreSQL 18, the seed loads, and key constraints hold. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers
class DataModelTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18-alpine");

    @Autowired CustomerProfileRepository profiles;
    @Autowired ContactPersonRepository contacts;
    @Autowired BankAccountRepository bankAccounts;
    @Autowired AddressRepository addresses;
    @Autowired RelatedPartyRepository relatedParties;
    @Autowired AnnualReportRepository annualReports;
    @Autowired MarketRegionRepository marketRegions;
    @Autowired ProfileAccessRepository access;

    private static final String BIOMARKET = "10966560";

    @Test
    void seedLoadsScenarioOneProfile() {
        CustomerProfile p = profiles.findByRegistryCode(BIOMARKET).orElseThrow();
        assertThat(p.getBusinessName()).isEqualTo("Biomarket OÜ");
        assertThat(p.getWebsiteSource()).isEqualTo(Source.USER);
        assertThat(p.getEmtakSource()).isEqualTo(Source.REGISTRY);

        UUID id = p.getId();
        assertThat(contacts.findByProfileId(id)).hasSize(1);
        assertThat(bankAccounts.findByProfileId(id)).hasSize(1);
        assertThat(addresses.findByProfileId(id)).hasSize(2);
        assertThat(relatedParties.findByProfileId(id)).hasSize(3);
        assertThat(annualReports.findByProfileIdOrderByReportYearDesc(id)).hasSize(3);
        assertThat(marketRegions.findByProfileId(id)).hasSize(6);
        assertThat(access.findByPersonCode("37510090251")).hasSize(1);
    }

    @Test
    void oneAddressPerTypeIsEnforced() {
        UUID id = profiles.findByRegistryCode(BIOMARKET).orElseThrow().getId();
        Address duplicateLegal = new Address();
        duplicateLegal.setProfileId(id);
        duplicateLegal.setAddressType("LEGAL");
        duplicateLegal.setFullAddress("Some other legal address");
        duplicateLegal.setSource(Source.REGISTRY);

        assertThatThrownBy(() -> addresses.saveAndFlush(duplicateLegal))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deletingProfileCascadesToChildren() {
        CustomerProfile p = new CustomerProfile();
        p.setRegistryCode("99999999");
        p.setBusinessName("Cascade Test OÜ");
        p.setBusinessNameSource(Source.REGISTRY);
        p = profiles.saveAndFlush(p);
        UUID id = p.getId();

        ContactPerson c = new ContactPerson();
        c.setProfileId(id);
        c.setFullName("Test Contact");
        c.setSource(Source.USER);
        contacts.saveAndFlush(c);
        assertThat(contacts.findByProfileId(id)).hasSize(1);

        profiles.delete(p);
        profiles.flush();

        assertThat(profiles.findByRegistryCode("99999999")).isEmpty();
        assertThat(contacts.findByProfileId(id)).isEmpty(); // via DB ON DELETE CASCADE
    }
}
