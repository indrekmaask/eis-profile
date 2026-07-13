import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DdsButton,
  DdsInput,
  DdsPhoneInput,
  DdsStep,
  DdsStepper,
  DdsTagInput,
} from '@dds/ui';
import { derivePersonInfo } from '@eis/profile-api';
import { CreateProfileRequest, PrefillView } from '../../models/profile.models';
import { TARGET_MARKETS, formatEstonianDate } from '../../models/vocabulary';

type ContactGroup = FormGroup<{
  fullName: FormControl<string>;
  role: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  personCode: FormControl<string>;
  primary: FormControl<boolean>;
}>;

interface PartySuggestion {
  displayName: string;
  personCode: string;
  roles: string;
}

/** Scenario 2: "Profiili loomine" — the 3-step creation wizard (v22 flows). */
@Component({
  selector: 'app-profile-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DdsButton, DdsInput, DdsPhoneInput, DdsStepper, DdsTagInput],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss',
})
export class ProfileEdit {
  readonly mode = input<'create'>('create');
  readonly prefill = input<PrefillView | null>(null);
  readonly saving = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly createProfile = output<CreateProfileRequest>();
  readonly cancel = output<void>();

  protected readonly markets = TARGET_MARKETS;
  protected readonly steps: DdsStep[] = [
    { label: 'Üldandmed' },
    { label: 'Kontaktisikud' },
    { label: 'Muud andmed' },
  ];
  protected readonly activeStep = signal(0);
  protected readonly contactsError = signal<string | null>(null);

  protected readonly form = new FormGroup({
    operatingAddress: new FormControl('', { nonNullable: true }),
    website: new FormControl('', { nonNullable: true }),
    employeeCount: new FormControl('', { nonNullable: true }),
    contacts: new FormArray<ContactGroup>([]),
    targetMarkets: new FormControl<string[]>([], { nonNullable: true }),
  });

  protected readonly asOf = computed(() => formatEstonianDate(this.prefill()?.dataAsOfDate));

  protected readonly emtak = computed(() => {
    const pf = this.prefill();
    if (!pf) {
      return null;
    }
    return pf.emtakName ? `${pf.emtakCode} — ${pf.emtakName}` : pf.emtakCode;
  });

  /** Natural persons from the register, offered as one-click contact suggestions. */
  protected readonly partySuggestions = computed<PartySuggestion[]>(() => {
    const groups = new Map<string, PartySuggestion>();
    for (const rp of this.prefill()?.relatedParties ?? []) {
      const natural = rp.partyType === 'NATURAL' || rp.partyType === 'Füüsiline isik';
      if (!natural || !rp.registryCode) {
        continue;
      }
      const g = groups.get(rp.registryCode);
      if (g) {
        g.roles = `${g.roles}, ${rp.role}`;
      } else {
        groups.set(rp.registryCode, {
          displayName: rp.displayName,
          personCode: rp.registryCode,
          roles: rp.role,
        });
      }
    }
    // Hide people already added as contacts.
    const used = new Set(this.contactValues().map((c) => c.personCode));
    return [...groups.values()].filter((s) => !used.has(s.personCode));
  });

  /** Register-owned parties (read-only block under step 2). */
  protected readonly relatedParties = computed(() => this.prefill()?.relatedParties ?? []);

  private readonly contactsVersion = signal(0);

  get contacts(): FormArray<ContactGroup> {
    return this.form.controls.contacts;
  }

  private contactValues(): { personCode: string }[] {
    this.contactsVersion();
    return this.contacts.controls.map((g) => ({ personCode: g.controls.personCode.value }));
  }

  protected addContact(prefillFrom?: PartySuggestion): void {
    this.contacts.push(
      new FormGroup({
        fullName: new FormControl(prefillFrom?.displayName ?? '', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        role: new FormControl(prefillFrom ? prefillFrom.roles.split(',')[0].trim() : '', {
          nonNullable: true,
        }),
        email: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.email],
        }),
        phone: new FormControl('', { nonNullable: true }),
        personCode: new FormControl(prefillFrom?.personCode ?? '', { nonNullable: true }),
        primary: new FormControl(this.contacts.length === 0, { nonNullable: true }),
      }),
    );
    this.contactsVersion.update((v) => v + 1);
    this.contactsError.set(null);
  }

  protected removeContact(i: number): void {
    const wasPrimary = this.contacts.at(i).controls.primary.value;
    this.contacts.removeAt(i);
    if (wasPrimary && this.contacts.length) {
      this.contacts.at(0).controls.primary.setValue(true);
    }
    this.contactsVersion.update((v) => v + 1);
  }

  protected setPrimary(i: number): void {
    this.contacts.controls.forEach((g, idx) => g.controls.primary.setValue(idx === i));
  }

  protected birthLabel(personCode: string): string | null {
    const info = derivePersonInfo(personCode);
    return info ? info.birthDateDisplay.replace(/(^|\.)0/g, '$1') : null;
  }

  protected isNatural(partyType: string | null): boolean {
    return partyType === 'NATURAL' || partyType === 'Füüsiline isik';
  }

  protected go(i: number): void {
    this.activeStep.set(Math.max(0, Math.min(this.steps.length - 1, i)));
  }
  protected next(): void {
    if (this.activeStep() === 1 && !this.contactsValid()) {
      return;
    }
    this.go(this.activeStep() + 1);
  }
  protected prev(): void {
    this.go(this.activeStep() - 1);
  }

  protected readonly isLastStep = computed(() => this.activeStep() === this.steps.length - 1);

  private contactsValid(): boolean {
    if (!this.contacts.length) {
      this.contactsError.set('Lisa vähemalt üks kontaktisik.');
      return false;
    }
    if (this.contacts.invalid) {
      this.contacts.markAllAsTouched();
      return false;
    }
    this.contactsError.set(null);
    return true;
  }

  protected onCreate(): void {
    if (!this.contactsValid()) {
      this.go(1);
      return;
    }
    const rc = this.prefill()?.registryCode;
    if (!rc) {
      return;
    }
    const raw = this.form.controls.employeeCount.value.trim();
    const n = raw ? Number(raw) : null;
    const request: CreateProfileRequest = {
      registryCode: rc,
      website: this.form.controls.website.value || null,
      employeeCount: n != null && Number.isFinite(n) ? n : null,
      operatingAddress: this.form.controls.operatingAddress.value || null,
      contacts: this.contacts.controls.map((g) => ({
        fullName: g.controls.fullName.value,
        role: g.controls.role.value || null,
        email: g.controls.email.value || null,
        phone: g.controls.phone.value || null,
        personCode: g.controls.personCode.value || null,
        primary: g.controls.primary.value,
      })),
      bankAccounts: [],
      targetMarkets: this.form.controls.targetMarkets.value,
      operatingRegions: [],
    };
    this.createProfile.emit(request);
  }

  protected showError(control: { invalid: boolean; touched: boolean }): boolean {
    return control.invalid && control.touched;
  }

  protected money(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '—';
    }
    const abs = new Intl.NumberFormat('et-EE', {
      maximumFractionDigits: 0,
      useGrouping: 'always' as unknown as boolean,
    }).format(Math.abs(value));
    return `${value < 0 ? '−' : ''}${abs} €`;
  }
}
