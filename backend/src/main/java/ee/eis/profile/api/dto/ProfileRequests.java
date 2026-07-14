package ee.eis.profile.api.dto;

import java.util.List;

public final class ProfileRequests {

    private ProfileRequests() {}

    /** Create a profile: register data is fetched server-side; the body carries USER-owned fields. */
    public record CreateProfileRequest(
            String registryCode,
            String actingPersonCode,
            String website,
            Integer employeeCount,
            String operatingAddress,
            List<ContactInput> contacts,
            List<BankAccountInput> bankAccounts,
            List<String> targetMarkets,
            List<String> operatingRegions) {}

    /**
     * The edit wizard's user fields, sent as ONE request covering every step so the save is
     * atomic. Scalars are always present: null/blank means cleared. Null collections are
     * left unchanged.
     */
    public record StepUpdateRequest(
            Integer employeeCount,
            String website,
            String operatingAddress,
            List<ContactInput> contacts,
            List<BankAccountInput> bankAccounts,
            List<String> targetMarkets,
            List<String> operatingRegions) {}

    public record ContactInput(String fullName, String role, String email, String phone,
                               String personCode, boolean primary) {}

    public record BankAccountInput(String iban, String bankName, boolean primary) {}
}
