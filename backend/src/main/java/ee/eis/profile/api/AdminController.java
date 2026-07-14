package ee.eis.profile.api;

import java.util.Map;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Demo helper: wipes the profile schema and re-runs Flyway migrations + seed so the
 * demo can be reset to Biomarket's canonical state. Intentionally unguarded (demo only) —
 * anyone reaching the public URL can trigger it; it only affects the seeded demo data.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final Flyway flyway;

    public AdminController(Flyway flyway) {
        this.flyway = flyway;
    }

    @PostMapping("/reseed")
    public Map<String, Object> reseed() {
        flyway.clean();
        MigrateResult result = flyway.migrate();
        return Map.of(
            "status", "reseeded",
            "migrationsApplied", result.migrationsExecuted
        );
    }
}
