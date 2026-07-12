import { Injectable, computed, effect, signal } from '@angular/core';
import { derivePersonInfo } from '@eis/profile-api';

interface Company {
  registryCode: string;
  name: string;
}

const STORAGE_KEY = 'eis.identity';

interface Persisted {
  personCode: string;
  personName: string;
  activeCompany: Company | null;
}

function load(): Persisted {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Persisted;
    }
  } catch {
    /* ignore corrupt/unavailable storage */
  }
  return { personCode: '', personName: '', activeCompany: null };
}

/**
 * Mock identity for the dev login — NO real RIA / TARA. Holds the acting person's
 * ID code; the birth date is derived client-side from the code (once-only).
 * State is mirrored to sessionStorage so a page reload keeps the session (and the
 * portal chrome/sidebar) instead of logging the user out.
 */
@Injectable({ providedIn: 'root' })
export class IdentityService {
  private readonly initial = load();

  readonly personCode = signal<string>(this.initial.personCode);
  readonly personName = signal<string>(this.initial.personName);
  readonly info = computed(() => derivePersonInfo(this.personCode()));
  readonly loggedIn = computed(() => this.personCode().length === 11);

  /** Company selected via "Vali roll"; drives the once-only reuse views. */
  readonly activeCompany = signal<Company | null>(this.initial.activeCompany);

  constructor() {
    effect(() => {
      const state: Persisted = {
        personCode: this.personCode(),
        personName: this.personName(),
        activeCompany: this.activeCompany(),
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* ignore unavailable storage */
      }
    });
  }

  login(personCode: string, personName = ''): void {
    this.personCode.set(personCode.trim());
    this.personName.set(personName);
  }
  logout(): void {
    this.personCode.set('');
    this.personName.set('');
    this.activeCompany.set(null);
  }
  selectCompany(registryCode: string, name: string): void {
    this.activeCompany.set({ registryCode, name });
  }
}
