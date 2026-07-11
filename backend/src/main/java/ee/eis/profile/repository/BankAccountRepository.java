package ee.eis.profile.repository;

import ee.eis.profile.domain.BankAccount;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankAccountRepository extends JpaRepository<BankAccount, UUID> {
    List<BankAccount> findByProfileId(UUID profileId);
}
