package ee.eis.profile.domain;

/** {@link #dbValue()} is the Estonian value stored per the ERD; the enum name is the API/code value. */
public enum SnapshotType {
    PRE_ADVISORY("NÕUSTAMISE_EELREGISTREERIMINE"),
    APPLICATION("TAOTLUS");

    private final String dbValue;

    SnapshotType(String dbValue) {
        this.dbValue = dbValue;
    }

    public String dbValue() {
        return dbValue;
    }
}
