/**
 * Estonian personal identification code (isikukood) helpers.
 * Format GYYMMDDSSSC (11 digits): G = century+sex, YYMMDD = birth date,
 * SSS = serial, C = checksum. Birth-date derivation is client-side and does
 * NOT hit any register (once-only: the profile already carries the person code).
 */

export interface PersonCodeInfo {
  birthDate: string; // ISO yyyy-MM-dd
  birthDateDisplay: string; // dd.MM.yyyy
  sex: 'M' | 'F';
}

const CENTURY: Record<string, number> = {
  '1': 1800,
  '2': 1800,
  '3': 1900,
  '4': 1900,
  '5': 2000,
  '6': 2000,
  '7': 2100,
  '8': 2100,
};

/** Derives birth date + sex, or null if the code is structurally invalid. */
export function derivePersonInfo(code: string | null | undefined): PersonCodeInfo | null {
  if (!code || !/^\d{11}$/.test(code)) {
    return null;
  }
  const g = code[0];
  const base = CENTURY[g];
  if (base === undefined) {
    return null;
  }
  const year = base + Number(code.slice(1, 3));
  const month = Number(code.slice(3, 5));
  const day = Number(code.slice(5, 7));
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const d = new Date(Date.UTC(year, month - 1, day));
  // Reject impossible dates (e.g. 31 Feb rolled over).
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }
  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return {
    birthDate: `${yyyy}-${mm}-${dd}`,
    birthDateDisplay: `${dd}.${mm}.${yyyy}`,
    sex: Number(g) % 2 === 1 ? 'M' : 'F',
  };
}
