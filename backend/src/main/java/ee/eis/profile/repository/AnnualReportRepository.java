package ee.eis.profile.repository;

import ee.eis.profile.domain.AnnualReport;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnualReportRepository extends JpaRepository<AnnualReport, UUID> {
    List<AnnualReport> findByProfileIdOrderByReportYearDesc(UUID profileId);
}
