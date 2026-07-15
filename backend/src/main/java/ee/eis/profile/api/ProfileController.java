package ee.eis.profile.api;

import ee.eis.profile.api.dto.AccessEntry;
import ee.eis.profile.api.dto.AuditEntry;
import ee.eis.profile.api.dto.PrefillView;
import ee.eis.profile.api.dto.ProfileRequests.CreateProfileRequest;
import ee.eis.profile.api.dto.ProfileRequests.StepUpdateRequest;
import ee.eis.profile.api.dto.ProfileView;
import ee.eis.profile.api.dto.SnapshotSummary;
import ee.eis.profile.domain.SnapshotType;
import ee.eis.profile.service.ProfileCommandService;
import ee.eis.profile.service.ProfileLookupService;
import ee.eis.profile.service.AuditService;
import ee.eis.profile.service.ProfileQueryService;
import ee.eis.profile.service.ProfileSnapshotService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
    private final ProfileSnapshotService snapshotService;
    private final AuditService auditService;

    public ProfileController(ProfileQueryService queryService, ProfileLookupService lookupService,
                             ProfileCommandService commandService, ProfileSnapshotService snapshotService,
                             AuditService auditService) {
        this.queryService = queryService;
        this.lookupService = lookupService;
        this.commandService = commandService;
        this.snapshotService = snapshotService;
        this.auditService = auditService;
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

    @PostMapping("/profiles/{registryCode}/snapshots")
    public ResponseEntity<SnapshotSummary> captureSnapshot(@PathVariable String registryCode,
                                                           @RequestParam SnapshotType type) {
        return ResponseEntity.status(HttpStatus.CREATED).body(snapshotService.capture(registryCode, type));
    }

    @GetMapping("/profiles/{registryCode}/snapshots")
    public List<SnapshotSummary> listSnapshots(@PathVariable String registryCode) {
        return snapshotService.list(registryCode);
    }

    @GetMapping(value = "/profiles/{registryCode}/snapshots/{snapshotId}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getSnapshot(@PathVariable String registryCode,
                                              @PathVariable UUID snapshotId) {
        return ResponseEntity.ok(snapshotService.getPayload(registryCode, snapshotId));
    }

    @GetMapping("/profiles/{registryCode}/audit")
    public List<AuditEntry> auditTrail(@PathVariable String registryCode) {
        return auditService.list(registryCode);
    }

    /** Mock identity switcher / "Vali roll": companies linked to a person's ID code. */
    @GetMapping("/access")
    public List<AccessEntry> access(@RequestParam String personCode) {
        return queryService.listAccessFor(personCode);
    }
}
