import { Injectable, signal } from '@angular/core';

/**
 * Active company + acting person. In Phase 5 the mock identity switcher / "Vali roll"
 * drives these; for Phase 4 they default to the seeded Biomarket owner (Scenario 1)
 * and can be overridden via `?rc=` / `?person=` query params for demoing Scenario 2.
 */
const DEFAULT_REGISTRY_CODE = '10966560'; // Biomarket OÜ (seeded)
const DEFAULT_PERSON_CODE = '37510090251'; // seeded OWNER

@Injectable({ providedIn: 'root' })
export class ProfileContextService {
  readonly registryCode = signal(readParam('rc') ?? DEFAULT_REGISTRY_CODE);
  readonly personCode = signal(readParam('person') ?? DEFAULT_PERSON_CODE);

  setCompany(registryCode: string): void {
    this.registryCode.set(registryCode);
  }

  setPerson(personCode: string): void {
    this.personCode.set(personCode);
  }
}

function readParam(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return new URLSearchParams(window.location.search).get(name);
}
