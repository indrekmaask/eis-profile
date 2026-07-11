package ee.eis.profile.api.dto;

import java.util.List;

/** Request bodies for creating and updating a profile (used by the create flow and the edit stepper). */
public final class ProfileRequests {

    private ProfileRequests() {}

    /** Create a profile: register data is fetched server-side; the body carries USER-owned fields. */
    public record CreateProfileRequest(
            String registryCode,
            String website,
            Integer employeeCount,
            String operatingAddress,
            List<ContactInput> contacts,
            List<BankAccountInput> bankAccounts,
            List<String> targetMarkets,
            List<String> operatingRegions) {}

    /** A single edit-stepper step's user fields. Unknown/omitted fields are left unchanged. */
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
