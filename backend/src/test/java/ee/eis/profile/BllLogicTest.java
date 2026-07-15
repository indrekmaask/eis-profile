package ee.eis.profile;

import static org.assertj.core.api.Assertions.assertThat;

import ee.eis.profile.domain.Source;
import ee.eis.profile.service.PersonCodeDeriver;
import ee.eis.profile.service.ProfileCompletenessCalculator;
import ee.eis.profile.service.ProfileCompletenessCalculator.Input;
import ee.eis.profile.service.ValueResolver;
import ee.eis.profile.service.validation.IbanValidator;
import ee.eis.profile.service.validation.MarketVocabulary;
import ee.eis.profile.service.validation.PersonCodeValidator;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

/** Fast unit tests for the pure-logic BLL primitives (no Spring context, no DB). */
class BllLogicTest {

    private final IbanValidator iban = new IbanValidator();
    private final PersonCodeValidator personCode = new PersonCodeValidator();
    private final PersonCodeDeriver deriver = new PersonCodeDeriver();
    private final MarketVocabulary vocab = new MarketVocabulary();
    private final ValueResolver resolver = new ValueResolver();
    private final ProfileCompletenessCalculator completeness = new ProfileCompletenessCalculator();

    @Test
    void ibanChecksum() {
        assertThat(iban.isValid("EE382200221020145685")).isTrue();  // valid Estonian IBAN
        assertThat(iban.isValid("GB82WEST12345698765432")).isTrue();
        assertThat(iban.isValid("EE382200221020145686")).isFalse(); // bad check digits
        assertThat(iban.isValid("XX")).isFalse();
        assertThat(iban.isValid(null)).isFalse();
    }

    @Test
    void estonianPersonCodeChecksum() {
        assertThat(personCode.isValid("37510090251")).isTrue();
        assertThat(personCode.isValid("49403136515")).isTrue();
        assertThat(personCode.isValid("38502020023")).isTrue(); // mock API test code (checksum not enforced)
        assertThat(personCode.isValid("39913320000")).isFalse(); // impossible date
        assertThat(personCode.isValid("123")).isFalse();
    }

    @Test
    void birthDateDerivedFromPersonCode() {
        assertThat(deriver.birthDate("37510090251")).contains(LocalDate.of(1975, 10, 9));
        assertThat(deriver.birthDate("50003040001")).contains(LocalDate.of(2000, 3, 4));
        assertThat(deriver.birthDate("bad")).isEmpty();
    }

    @Test
    void controlledVocabulary() {
        assertThat(vocab.isValid("TARGET_MARKET", "EE")).isTrue();
        assertThat(vocab.isValid("TARGET_MARKET", "ZZ")).isFalse();
        assertThat(vocab.isValid("OPERATING_REGION", "TALLINN")).isTrue();
        assertThat(vocab.isValid("OPERATING_REGION", "ATLANTIS")).isFalse();
    }

    @Test
    void priorityRuleKeepsUserValue() {
        // USER value is never overwritten by a register refresh.
        var kept = resolver.mergeRegistry("user@x.ee", Source.USER, "reg@x.ee");
        assertThat(kept.value()).isEqualTo("user@x.ee");
        assertThat(kept.source()).isEqualTo(Source.USER);

        // Non-user value is updated from the register.
        var updated = resolver.mergeRegistry("old", Source.REGISTRY, "fresh");
        assertThat(updated.value()).isEqualTo("fresh");
        assertThat(updated.source()).isEqualTo(Source.REGISTRY);
    }

    @Test
    void completenessChecklist() {
        var full = completeness.calculate(new Input(true, true, true, true));
        assertThat(full.missing()).isEmpty();

        var partial = completeness.calculate(new Input(true, true, true, false));
        assertThat(partial.missing()).containsExactly("website");
    }
}
