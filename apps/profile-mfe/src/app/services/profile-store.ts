import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { profileErrorMessage } from '@eis/profile-api';
import {
  CreateProfileRequest,
  PrefillView,
  ProfileView,
  StepUpdateRequest,
} from '../models/profile.models';
import { ProfileApiService } from './profile-api.service';
import { ProfileContextService } from './profile-context.service';

/**
 * - loading: request in flight
 * - loaded: profile exists (Scenario 1)
 * - empty: no profile yet — offer creation (Scenario 2)
 * - unavailable: register is down (503) — show last-saved data + notice
 * - error: unexpected failure
 */
export type ProfileStatus = 'idle' | 'loading' | 'loaded' | 'empty' | 'unavailable' | 'error';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly api = inject(ProfileApiService);
  private readonly context = inject(ProfileContextService);

  /** Monotonic load id: responses from a superseded load (company switched) are ignored. */
  private loadSeq = 0;

  readonly status = signal<ProfileStatus>('idle');
  readonly profile = signal<ProfileView | null>(null);
  readonly prefill = signal<PrefillView | null>(null);
  readonly saving = signal(false);
  readonly toast = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly completeness = computed(() => this.profile()?.completeness.percent ?? 0);
  readonly hasDiscrepancies = computed(() => (this.profile()?.discrepancies.length ?? 0) > 0);

  /** Load an existing profile; on 404 fall back to prefill (creation flow). */
  load(registryCode: string): void {
    const seq = ++this.loadSeq;
    this.status.set('loading');
    this.errorMessage.set(null);
    this.api.getProfile(registryCode).subscribe({
      next: (p) => {
        if (seq !== this.loadSeq) {
          return;
        }
        this.profile.set(p);
        this.status.set('loaded');
      },
      error: (err: HttpErrorResponse) => {
        if (seq !== this.loadSeq) {
          return;
        }
        if (err.status === 404) {
          this.loadPrefill(registryCode, seq);
        } else {
          this.fail(err);
        }
      },
    });
  }

  private loadPrefill(registryCode: string, seq: number): void {
    this.api.prefill(registryCode).subscribe({
      next: (p) => {
        if (seq !== this.loadSeq) {
          return;
        }
        this.prefill.set(p);
        this.profile.set(null);
        this.status.set('empty');
      },
      error: (err: HttpErrorResponse) => {
        if (seq === this.loadSeq) {
          this.fail(err);
        }
      },
    });
  }

  create(request: CreateProfileRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);
    this.api.create({ ...request, actingPersonCode: this.context.personCode() }).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.status.set('loaded');
        this.saving.set(false);
        this.toast.set('Profiil loodud');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        if (err.status === 400) {
          // Validation failure: stay in the create flow and surface the message inline.
          this.errorMessage.set(profileErrorMessage(err, 'Kontrolli sisestatud andmeid'));
        } else {
          this.fail(err);
        }
      },
    });
  }

  updateStep(registryCode: string, step: number, body: StepUpdateRequest): void {
    this.saving.set(true);
    this.api.updateStep(registryCode, step, body).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.saving.set(false);
        this.toast.set('Salvestatud');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.fail(err);
      },
    });
  }

  refresh(registryCode: string): void {
    this.saving.set(true);
    this.api.refresh(registryCode).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.status.set('loaded');
        this.saving.set(false);
        this.toast.set('Andmed värskendatud registrist');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        if (err.status === 503) {
          // Register down: keep the last-saved profile readable (CFR-047).
          this.status.set(this.profile() ? 'unavailable' : 'error');
          this.errorMessage.set('Register on ajutiselt kättesaamatu. Kuvatakse viimati salvestatud andmed.');
        } else {
          this.fail(err);
        }
      },
    });
  }

  // Create flow "Värskenda andmeid": no profile exists yet to re-sync, so
  // re-pull the register prefill. Same user-facing effect + toast as refresh().
  reloadPrefill(registryCode: string): void {
    this.saving.set(true);
    this.api.prefill(registryCode).subscribe({
      next: (p) => {
        this.prefill.set(p);
        this.saving.set(false);
        this.toast.set('Andmed värskendatud registrist');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.fail(err);
      },
    });
  }

  clearToast(): void {
    this.toast.set(null);
  }

  private fail(err: HttpErrorResponse): void {
    this.status.set('error');
    this.errorMessage.set(err.error?.detail ?? err.message ?? 'Tekkis ootamatu viga');
  }
}
