package ee.eis.profile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import ee.eis.profile.api.dto.ProfileRequests.BankAccountInput;
import ee.eis.profile.api.dto.ProfileRequests.ContactInput;
import ee.eis.profile.api.dto.ProfileRequests.CreateProfileRequest;
import ee.eis.profile.api.dto.ProfileView;
import ee.eis.profile.integration.RegistryClient;
import ee.eis.profile.integration.RegistryUnavailableException;
import ee.eis.profile.integration.dto.CompanyResponse;
import ee.eis.profile.integration.dto.CompanyResponse.AnnualReportResponse;
import ee.eis.profile.integration.dto.CompanyResponse.RelatedPartyResponse;
import ee.eis.profile.service.ProfileCommandService;
import ee.eis.profile.service.ProfileNotFoundException;
import ee.eis.profile.service.ProfileQueryService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** End-to-end BLL flow on PostgreSQL 18 with a stubbed register. Each test uses its own code. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers
class ProfileFlowIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18-alpine");

    @MockitoBean RegistryClient registryClient;

    @Autowired ProfileCommandService command;
    @Autowired ProfileQueryService query;

    private CompanyResponse company(String rc, String name) {
        return new CompanyResponse(rc, name, "2026-05-15T00:00:00Z", "Osaühing",
                "Tartu maakond, Tartu, Näidis tn 1", "47111", "Toidukaupade jaemüük", 2500L,
                List.of(), List.of(new RelatedPartyResponse("Osanik", "12305242", "EE", "Juriidiline isik",
                        null, null, "Philia OÜ", new BigDecimal("100.00"))),
                List.of(), List.of(),
                List.of(new AnnualReportResponse(2025, true, true, 500000L, null, null, null, null,
                        null, null, 42000L, null, 300000L, null, null, null, 120000L, null,
                        null, null, null, null, null, null, null, null, null, null, null, null, null, null)));
    }

    private CreateProfileRequest fullCreate(String rc) {
        return new CreateProfileRequest(rc, "https://porgand.ee", 12, "Tartu, Näidis tn 1",
                List.of(new ContactInput("Mari Maasikas", "Juhatuse liige", "mari@porgand.ee",
                        "+372 5551 2345", "37510090251", true)),
                List.of(new BankAccountInput("EE382200221020145685", "Swedbank", true)),
                List.of("FI"), List.of("TARTU"));
    }

    @Test
    void createThenReadResolvesSourcesAndCompleteness() {
        String rc = "16789012";
        when(registryClient.fetchCompany(rc)).thenReturn(Optional.of(company(rc, "Porgand OÜ")));

        ProfileView created = command.create(fullCreate(rc));
        assertThat(created.businessName().value()).isEqualTo("Porgand OÜ");
        assertThat(created.businessName().source()).isEqualTo("REGISTRY");
        assertThat(created.website().source()).isEqualTo("USER");
        assertThat(created.completeness().percent()).isEqualTo(100);
        assertThat(created.relatedParties()).hasSize(1);
        assertThat(created.annualReports()).hasSize(1);
        assertThat(created.addresses()).extracting(ProfileView.AddressView::addressType)
                .containsExactlyInAnyOrder("LEGAL", "OPERATING");

        ProfileView read = query.getProfile(rc);
        assertThat(read.marketRegions()).extracting(ProfileView.MarketRegionView::value)
                .containsExactlyInAnyOrder("FI", "TARTU");
    }

    @Test
    void refreshDetectsDiscrepancyAndKeepsUserValues() {
        String rc = "16111111";
        when(registryClient.fetchCompany(rc)).thenReturn(Optional.of(company(rc, "Porgand OÜ")));
        command.create(fullCreate(rc));

        when(registryClient.fetchCompany(rc)).thenReturn(Optional.of(company(rc, "Porgand Uus OÜ")));
        ProfileView refreshed = command.refresh(rc);

        assertThat(refreshed.discrepancies()).extracting(ProfileView.Discrepancy::field).contains("businessName");
        assertThat(refreshed.businessName().value()).isEqualTo("Porgand Uus OÜ"); // register-owned -> updated
        assertThat(refreshed.website().value()).isEqualTo("https://porgand.ee");  // USER -> preserved
    }

    @Test
    void refreshWhenRegisterDownPropagates() {
        String rc = "16222222";
        when(registryClient.fetchCompany(rc)).thenReturn(Optional.of(company(rc, "Porgand OÜ")));
        command.create(fullCreate(rc));

        when(registryClient.fetchCompany(rc)).thenThrow(new RegistryUnavailableException("down", null));
        assertThatThrownBy(() -> command.refresh(rc)).isInstanceOf(RegistryUnavailableException.class);
        // The stored profile remains readable (CFR-047).
        assertThat(query.getProfile(rc).businessName().value()).isEqualTo("Porgand OÜ");
    }

    @Test
    void createForUnknownCompanyIsNotFound() {
        when(registryClient.fetchCompany("00000000")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> command.create(new CreateProfileRequest("00000000", null, null, null,
                null, null, null, null))).isInstanceOf(ProfileNotFoundException.class);
    }

    @Test
    void accessListsSeededBiomarketForPerson() {
        assertThat(query.listAccessFor("48505150220"))
                .anySatisfy(e -> assertThat(e.registryCode()).isEqualTo("10966560"));
    }
}
