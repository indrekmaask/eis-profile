package ee.eis.profile.api.dto;

/** One company a person may act for — drives the mock identity switcher / "Vali roll". */
public record AccessEntry(String registryCode, String businessName, String accessRole) {}
