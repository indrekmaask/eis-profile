import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DdsButton, DdsCard, DdsDropdown, DdsInput, DdsPhoneInput, type DdsOption } from '@dds/ui';
import { ProfileApiService, ProfileView } from '@eis/profile-api';
import { IdentityService } from '../identity/identity.service';
import { exportRevenue, money } from './services.data';

const MARKET_LABELS: Record<string, string> = {
  EE: 'Eesti', FI: 'Soome', SE: 'Rootsi', LV: 'Läti', LT: 'Leedu', NO: 'Norra',
  DK: 'Taani', DE: 'Saksamaa', PL: 'Poola', NL: 'Holland', FR: 'Prantsusmaa',
  GB: 'Ühendkuningriik', US: 'Ameerika Ühendriigid',
};

/**
 * Arenguprogrammi eelnõustamine — registration form per Figma frame 192:6318:
 * read-only profile provenance rows plus a single participant picker.
 */
@Component({
  selector: 'app-pre-advisory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DdsButton, DdsCard, DdsDropdown, DdsInput, DdsPhoneInput],
  templateUrl: './pre-advisory.html',
  styleUrl: './pre-advisory.scss',
})
export class PreAdvisory {
  protected readonly identity = inject(IdentityService);
  private readonly api = inject(ProfileApiService);
  private readonly router = inject(Router);

  protected readonly profile = signal<ProfileView | null>(null);
  protected readonly profileMissing = signal(false);
  protected readonly done = signal(false);
  protected readonly submitAttempted = signal(false);

  protected readonly participant = new FormControl('', { nonNullable: true });
  private readonly participantId = toSignal(this.participant.valueChanges, { initialValue: '' });

  protected readonly newPerson = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly isNew = computed(() => this.participantId() === '__new__');

  protected readonly selectedContact = computed(
    () => this.profile()?.contacts.find((c) => c.id === this.participantId()) ?? null,
  );

  protected readonly participantOptions = computed<DdsOption[]>(() => [
    ...(this.profile()?.contacts ?? []).map((c) => ({
      value: c.id,
      label: c.role ? `${c.fullName} (${c.role})` : c.fullName,
    })),
    { value: '__new__', label: '+ Lisage uus isik', action: true },
  ]);

  // Editable copy of the picked contact's details — local to this form; edits here
  // never write back to the profile.
  protected readonly contactEdit = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly exportLabel = computed(() => {
    const r = this.profile()?.annualReports[0];
    return r ? money(exportRevenue(r)) : '—';
  });

  protected readonly marketsLabel = computed(() => {
    const codes = this.profile()?.cards.targetMarkets ?? [];
    return codes.length ? codes.map((c) => MARKET_LABELS[c] ?? c).join(', ') : '—';
  });

  constructor() {
    const company = this.identity.activeCompany();
    if (company) {
      this.api.getProfile(company.registryCode).subscribe({
        next: (p) => this.profile.set(p),
        error: () => this.profileMissing.set(true),
      });
    }
    effect(() => {
      const sc = this.selectedContact();
      if (sc) {
        this.contactEdit.setValue({ email: sc.email ?? '', phone: sc.phone ?? '' });
      }
    });
  }

  protected submit(): void {
    this.submitAttempted.set(true);
    if (!this.participant.value) {
      return;
    }
    if (this.isNew() && this.newPerson.invalid) {
      this.newPerson.markAllAsTouched();
      return;
    }
    if (!this.isNew() && this.contactEdit.invalid) {
      this.contactEdit.markAllAsTouched();
      return;
    }
    this.done.set(true);
    window.scrollTo(0, 0);
  }

  protected toDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  protected toRoles(): void {
    this.router.navigate(['/select-role']);
  }
}
