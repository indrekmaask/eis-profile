package ee.eis.profile.service;

import ee.eis.profile.domain.Source;
import org.springframework.stereotype.Component;

/**
 * Applies the effective-value priority rule USER &gt; REGISTRY &gt; CRM. Used when merging a fresh
 * register (or CRM) fetch into an existing profile: a value the user has taken ownership of is
 * never overwritten by a source update.
 */
@Component
public class ValueResolver {

    public record Resolved<T>(T value, Source source) {}

    /**
     * @param currentValue  the value currently stored
     * @param currentSource its source (may be null if unset)
     * @param registryValue the value freshly fetched from the register (may be null)
     */
    public <T> Resolved<T> mergeRegistry(T currentValue, Source currentSource, T registryValue) {
        if (currentSource == Source.USER) {
            return new Resolved<>(currentValue, Source.USER);
        }
        if (registryValue != null) {
            return new Resolved<>(registryValue, Source.REGISTRY);
        }
        return new Resolved<>(currentValue, currentSource);
    }
}
