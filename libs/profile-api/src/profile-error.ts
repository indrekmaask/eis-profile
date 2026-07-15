import { HttpErrorResponse } from '@angular/common/http';

/**
 * Turns a backend validation ProblemDetail (400 with an `errors` array of
 * English codes like "Invalid IBAN: EE00") into an Estonian, field-specific
 * message. Falls back to `fallback` for non-validation failures.
 */
export function profileErrorMessage(err: HttpErrorResponse, fallback: string): string {
  const errors: unknown = err?.error?.errors;
  if (Array.isArray(errors) && errors.length) {
    return errors.map(translate).join(' ');
  }
  return err?.error?.detail ?? fallback;
}

function translate(raw: string): string {
  const [code, value] = split(raw);
  switch (code) {
    case 'Invalid IBAN':
      return `Vigane IBAN: ${value}. Kontrolli kontonumbrit.`;
    case 'Invalid person code':
      return `Vigane isikukood: ${value}.`;
    case 'Unknown target market':
      return `Tundmatu sihtturg: ${value}.`;
    case 'Unknown operating region':
      return `Tundmatu tegevuspiirkond: ${value}.`;
    default:
      return raw;
  }
}

function split(raw: string): [string, string] {
  const i = raw.indexOf(':');
  return i === -1 ? [raw, ''] : [raw.slice(0, i).trim(), raw.slice(i + 1).trim()];
}
