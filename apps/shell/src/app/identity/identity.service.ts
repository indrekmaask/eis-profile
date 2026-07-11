import { Injectable, computed, signal } from '@angular/core';
import { derivePersonInfo } from '@eis/profile-api';

/**
 * Mock identity for the dev login — NO real RIA / TARA. Holds the acting person's
 * ID code; the birth date is derived client-side from the code (once-only).
 */
@Injectable({ providedIn: 'root' })
export class IdentityService {
  readonly personCode = signal<string>('');
  readonly info = computed(() => derivePersonInfo(this.personCode()));
  readonly loggedIn = computed(() => this.personCode().length === 11);

  /** Company selected via "Vali roll"; drives the once-only reuse views. */
  readonly activeCompany = signal<{ registryCode: string; name: string } | null>(null);

  login(personCode: string): void {
    this.personCode.set(personCode.trim());
  }
  logout(): void {
    this.personCode.set('');
    this.activeCompany.set(null);
  }
  selectCompany(registryCode: string, name: string): void {
    this.activeCompany.set({ registryCode, name });
  }
}
