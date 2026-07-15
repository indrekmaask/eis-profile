package ee.eis.profile.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.eis.profile.api.dto.ProfileView;
import ee.eis.profile.api.dto.SnapshotSummary;
import ee.eis.profile.domain.AuditAction;
import ee.eis.profile.domain.CustomerProfile;
import ee.eis.profile.domain.ProfileSnapshot;
import ee.eis.profile.domain.SnapshotType;
import ee.eis.profile.repository.CustomerProfileRepository;
import ee.eis.profile.repository.ProfileSnapshotRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileSnapshotService {

    private final CustomerProfileRepository profiles;
    private final ProfileQueryService queryService;
    private final ProfileSnapshotRepository snapshots;
    private final ObjectMapper objectMapper;
    private final AuditService auditService;

    public ProfileSnapshotService(CustomerProfileRepository profiles, ProfileQueryService queryService,
                                  ProfileSnapshotRepository snapshots, ObjectMapper objectMapper,
                                  AuditService auditService) {
        this.profiles = profiles;
        this.queryService = queryService;
        this.snapshots = snapshots;
        this.objectMapper = objectMapper;
        this.auditService = auditService;
    }

    @Transactional
    public SnapshotSummary capture(String registryCode, SnapshotType type) {
        CustomerProfile p = requireProfile(registryCode);
        ProfileView live = queryService.getProfile(registryCode);
        String payload;
        try {
            payload = objectMapper.writeValueAsString(live);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize profile snapshot", e);
        }
        ProfileSnapshot s = new ProfileSnapshot();
        s.setProfileId(p.getId());
        s.setSnapshotType(type.dbValue());
        s.setPayload(payload);
        SnapshotSummary summary = toSummary(snapshots.saveAndFlush(s));
        auditService.record(AuditAction.CAPTURE_SNAPSHOT, registryCode,
                Map.of("snapshotId", summary.id(), "snapshotType", summary.snapshotType()));
        return summary;
    }

    @Transactional(readOnly = true)
    public List<SnapshotSummary> list(String registryCode) {
        CustomerProfile p = requireProfile(registryCode);
        return snapshots.findByProfileIdOrderByCapturedAtDesc(p.getId()).stream()
                .map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public String getPayload(String registryCode, UUID snapshotId) {
        CustomerProfile p = requireProfile(registryCode);
        return snapshots.findByIdAndProfileId(snapshotId, p.getId())
                .map(ProfileSnapshot::getPayload)
                .orElseThrow(() -> new ProfileNotFoundException(registryCode));
    }

    private CustomerProfile requireProfile(String registryCode) {
        return profiles.findByRegistryCode(registryCode)
                .orElseThrow(() -> new ProfileNotFoundException(registryCode));
    }

    private SnapshotSummary toSummary(ProfileSnapshot s) {
        return new SnapshotSummary(s.getId().toString(), s.getSnapshotType(),
                s.getCapturedAt() == null ? null : s.getCapturedAt().toString());
    }
}
