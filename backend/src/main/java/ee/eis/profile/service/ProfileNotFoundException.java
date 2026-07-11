package ee.eis.profile.service;

/** No stored profile for the given registry code (Scenario 2 — nothing to display yet). */
public class ProfileNotFoundException extends RuntimeException {
    public ProfileNotFoundException(String registryCode) {
        super("No profile for registry code " + registryCode);
    }
}
