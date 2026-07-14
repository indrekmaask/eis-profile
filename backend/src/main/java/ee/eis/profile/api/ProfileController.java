package ee.eis.profile.api;

import ee.eis.profile.api.dto.AccessEntry;
import ee.eis.profile.api.dto.PrefillView;
import ee.eis.profile.api.dto.ProfileRequests.CreateProfileRequest;
import ee.eis.profile.api.dto.ProfileRequests.StepUpdateRequest;
import ee.eis.profile.api.dto.ProfileView;
import ee.eis.profile.service.ProfileCommandService;
import ee.eis.profile.service.ProfileLookupService;
import ee.eis.profile.service.ProfileQueryService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileQueryService queryService;
    private final ProfileLookupService lookupService;
    private final ProfileCommandService commandService;

    public ProfileController(ProfileQueryService queryService, ProfileLookupService lookupService,
                             ProfileCommandService commandService) {
        this.queryService = queryService;
        this.lookupService = lookupService;
        this.commandService = commandService;
    }

    /** Scenario 1: existing profile. 404 signals Scenario 2 (no profile yet). */
    @GetMapping("/profiles/{registryCode}")
    public ProfileView getProfile(@PathVariable String registryCode) {
        return queryService.getProfile(registryCode);
    }

    @GetMapping("/profiles/{registryCode}/prefill")
    public PrefillView prefill(@PathVariable String registryCode) {
        return lookupService.prefill(registryCode);
    }

    @PostMapping("/profiles")
    public ResponseEntity<ProfileView> create(@RequestBody CreateProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commandService.create(request));
    }

    @PatchMapping("/profiles/{registryCode}/step/{step}")
    public ProfileView updateStep(@PathVariable String registryCode, @PathVariable int step,
                                  @RequestBody StepUpdateRequest request) {
        return commandService.updateStep(registryCode, step, request);
    }

    @PostMapping("/profiles/{registryCode}/refresh")
    public ProfileView refresh(@PathVariable String registryCode) {
        return commandService.refresh(registryCode);
    }

    /** Mock identity switcher / "Vali roll": companies linked to a person's ID code. */
    @GetMapping("/access")
    public List<AccessEntry> access(@RequestParam String personCode) {
        return queryService.listAccessFor(personCode);
    }
}
