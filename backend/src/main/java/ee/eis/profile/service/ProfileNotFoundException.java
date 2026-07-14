package ee.eis.profile.service;

public class ProfileNotFoundException extends RuntimeException {
    public ProfileNotFoundException(String registryCode) {
        super("No profile for registry code " + registryCode);
    }
}
