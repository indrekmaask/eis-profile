import { Injectable, signal } from '@angular/core';

/**
 * Active company + acting person. Driven by the shell's mock identity switcher /
 * "Vali roll" (Phase 5) via the `?rc=` / `?person=` URL params, which ProfilePage
 * applies on every navigation. Defaults to the seeded Biomarket owner (Scenario 1).
 */
export const DEFAULT_REGISTRY_CODE = '10966560'; // Biomarket OÜ (seeded)
export const DEFAULT_PERSON_CODE = '48505150220'; // seeded OWNER (Eva Tamm, demo login)

@Injectable({ providedIn: 'root' })
export class ProfileContextService {
  readonly registryCode = signal(DEFAULT_REGISTRY_CODE);
  readonly personCode = signal(DEFAULT_PERSON_CODE);

  setCompany(registryCode: string): void {
    this.registryCode.set(registryCode);
  }

  setPerson(personCode: string): void {
    this.personCode.set(personCode);
  }
}
