package ee.eis.profile.domain;

/** Provenance of a data value. Effective value chosen by priority USER &gt; REGISTRY &gt; CRM (in the BLL). */
public enum Source {
    REGISTRY,
    CRM,
    USER
}
