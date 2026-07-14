import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import {
  BankAccount,
  BankAccountInput,
  ContactInput,
  CreateProfileRequest,
  PrefillView,
  ProfileView,
  StepUpdateRequest,
} from '../../models/profile.models';
import { OPERATING_REGIONS, TARGET_MARKETS, formatEstonianDate } from '../../models/vocabulary';
import { ProfileApiService } from '../../services/profile-api.service';

type ContactGroup = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
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

export function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}
export function joinName(first: string, last: string): string {
  return [first.trim(), last.trim()].filter(Boolean).join(' ');
}

@Component({
  selector: 'app-profile-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DdsButton, DdsInput, DdsPhoneInput, DdsStepper, DdsTagInput],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss',
})
export class ProfileEdit {
  readonly mode = input<'create' | 'edit'>('create');
  readonly prefill = input<PrefillView | null>(null);
  readonly profile = input<ProfileView | null>(null);
  readonly initialStep = input(0);
  readonly saving = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly createProfile = output<CreateProfileRequest>();
  readonly saved = output<void>();
  readonly refresh = output<void>();
  readonly cancel = output<void>();

  private readonly api = inject(ProfileApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly markets = TARGET_MARKETS;
  protected readonly regions = OPERATING_REGIONS;
  protected readonly steps: DdsStep[] = [
    { label: 'Üldandmed' },
    { label: 'Kontaktisikud' },
    { label: 'Muu' },
  ];
  protected readonly activeStep = signal(0);
  protected readonly contactsError = signal<string | null>(null);
  protected readonly editSaving = signal(false);
  protected readonly editError = signal<string | null>(null);

  protected readonly form = new FormGroup({
    operatingAddress: new FormControl('', { nonNullable: true }),
    website: new FormControl('', { nonNullable: true }),
    employeeCount: new FormControl('', { nonNullable: true }),
    contacts: new FormArray<ContactGroup>([]),
    targetMarkets: new FormControl<string[]>([], { nonNullable: true }),
    operatingRegions: new FormControl<string[]>([], { nonNullable: true }),
    bankAccounts: new FormArray<FormControl<string>>([]),
  });

  private readonly contactsVersion = signal(0);
  private populated = false;

  constructor() {
    effect(() => {
      if (this.populated) {
        return;
      }
      if (this.mode() === 'edit') {
        const p = this.profile();
        if (p) {
          this.populated = true;
          this.prefillFromProfile(p);
          this.activeStep.set(this.initialStep());
        }
      } else if (this.prefill()) {
        // Seed one empty primary contact so step 0 shows the same E-post/Telefon
        // fields as edit mode (create otherwise starts with no contacts).
        this.populated = true;
        if (!this.contacts.length) {
          this.contacts.push(this.contactGroup('', '', '', '', '', '', true));
          this.contactsVersion.update((v) => v + 1);
        }
      }
    });
  }

  protected readonly asOf = computed(() =>
    formatEstonianDate(
      this.mode() === 'edit' ? this.profile()?.dataAsOfDate : this.prefill()?.dataAsOfDate,
    ),
  );

  protected readonly emtak = computed(() => {
    const pf = this.prefill();
    if (!pf) {
      return null;
    }
    return pf.emtakName ? `${pf.emtakCode} — ${pf.emtakName}` : pf.emtakCode;
  });

  protected readonly profileEmtak = computed(() => {
    const p = this.profile();
    if (!p) {
      return null;
    }
    return p.emtakName.value ? `${p.emtakCode.value} — ${p.emtakName.value}` : p.emtakCode.value;
  });

  protected readonly profileLegalAddress = computed(
    () => this.profile()?.addresses.find((a) => a.addressType === 'LEGAL')?.fullAddress ?? null,
  );

  // Step 0 uses one layout for both modes; these resolve the locked register
  // fields from the profile (edit) or the register prefill (create).
  protected readonly companyName = computed(() =>
    this.mode() === 'edit'
      ? (this.profile()?.businessName.value ?? null)
      : (this.prefill()?.businessName ?? null),
  );
  protected readonly companyAddress = computed(() =>
    this.mode() === 'edit' ? this.profileLegalAddress() : (this.prefill()?.legalAddress ?? null),
  );
  protected readonly companyEmtak = computed(() =>
    this.mode() === 'edit' ? this.profileEmtak() : this.emtak(),
  );
  protected readonly companyCapital = computed(() =>
    this.mode() === 'edit'
      ? (this.profile()?.capitalSize.value ?? null)
      : (this.prefill()?.capitalSize ?? null),
  );

  protected readonly partySuggestions = computed<PartySuggestion[]>(() => {
    const parties =
      this.mode() === 'edit'
        ? (this.profile()?.relatedParties ?? [])
        : (this.prefill()?.relatedParties ?? []);
    const groups = new Map<string, PartySuggestion>();
    for (const rp of parties) {
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
    const used = new Set(this.contactValues().map((c) => c.personCode));
    return [...groups.values()].filter((s) => !used.has(s.personCode));
  });

  get contacts(): FormArray<ContactGroup> {
    return this.form.controls.contacts;
  }
  get bankAccounts(): FormArray<FormControl<string>> {
    return this.form.controls.bankAccounts;
  }

  protected primaryContact(): ContactGroup | null {
    this.contactsVersion();
    const arr = this.contacts.controls;
    return arr.find((g) => g.controls.primary.value) ?? arr[0] ?? null;
  }

  protected contactValues(): ContactInput[] {
    this.contactsVersion();
    return this.contacts.controls.map((g) => ({
      fullName: joinName(g.controls.firstName.value, g.controls.lastName.value),
      role: g.controls.role.value || null,
      email: g.controls.email.value || null,
      phone: g.controls.phone.value || null,
      personCode: g.controls.personCode.value || null,
      primary: g.controls.primary.value,
    }));
  }

  private originalBanks: BankAccount[] = [];

  private bankAccountValues(): BankAccountInput[] {
    const ibans = this.bankAccounts.controls.map((c) => c.value.trim()).filter(Boolean);
    // Preserve bankName/primary of unchanged accounts — the wizard only edits IBANs.
    const keepsPrimary = ibans.some(
      (iban) => this.originalBanks.find((o) => o.iban === iban)?.primary,
    );
    return ibans.map((iban, i) => {
      const orig = this.originalBanks.find((o) => o.iban === iban);
      return {
        iban,
        bankName: orig?.bankName ?? null,
        primary: keepsPrimary ? !!orig?.primary : i === 0,
      };
    });
  }

  private prefillFromProfile(p: ProfileView): void {
    this.form.controls.operatingAddress.setValue(
      p.addresses.find((a) => a.addressType === 'OPERATING')?.fullAddress ?? '',
    );
    this.form.controls.website.setValue(p.website.value ?? '');
    this.form.controls.employeeCount.setValue(
      p.employeeCount.value != null ? String(p.employeeCount.value) : '',
    );
    this.form.controls.targetMarkets.setValue([...p.cards.targetMarkets]);
    this.form.controls.operatingRegions.setValue([...(p.cards.operatingRegions ?? [])]);

    this.contacts.clear();
    p.contacts.forEach((c) => {
      const { first, last } = splitName(c.fullName);
      this.contacts.push(
        this.contactGroup(first, last, c.role ?? '', c.email ?? '', c.phone ?? '', c.personCode ?? '', c.primary),
      );
    });
    if (this.contacts.length && !this.contacts.controls.some((g) => g.controls.primary.value)) {
      this.contacts.at(0).controls.primary.setValue(true);
    }

    this.originalBanks = p.bankAccounts;
    this.bankAccounts.clear();
    p.bankAccounts.forEach((b) =>
      this.bankAccounts.push(new FormControl(b.iban, { nonNullable: true })),
    );
    if (!this.bankAccounts.length) {
      this.bankAccounts.push(new FormControl('', { nonNullable: true }));
    }
    this.contactsVersion.update((v) => v + 1);
  }

  private contactGroup(
    firstName: string,
    lastName: string,
    role: string,
    email: string,
    phone: string,
    personCode: string,
    primary: boolean,
  ): ContactGroup {
    return new FormGroup({
      firstName: new FormControl(firstName, { nonNullable: true, validators: [Validators.required] }),
      lastName: new FormControl(lastName, { nonNullable: true }),
      role: new FormControl(role, { nonNullable: true }),
      email: new FormControl(email, {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phone: new FormControl(phone, { nonNullable: true }),
      personCode: new FormControl(personCode, { nonNullable: true }),
      primary: new FormControl(primary, { nonNullable: true }),
    });
  }

  protected addContact(prefillFrom?: PartySuggestion): void {
    const { first, last } = prefillFrom
      ? splitName(prefillFrom.displayName)
      : { first: '', last: '' };
    this.contacts.push(
      this.contactGroup(
        first,
        last,
        prefillFrom ? prefillFrom.roles.split(',')[0].trim() : '',
        '',
        '',
        prefillFrom?.personCode ?? '',
        this.contacts.length === 0,
      ),
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

  protected onAddSelect(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    const v = sel.value;
    if (v === '__new__') {
      this.addContact();
    } else if (v) {
      const s = this.partySuggestions().find((x) => x.personCode === v);
      if (s) {
        this.addContact(s);
      }
    }
    sel.value = '';
  }

  protected addBank(): void {
    this.bankAccounts.push(new FormControl('', { nonNullable: true }));
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

  private employeeCountValue(): number | null {
    const raw = this.form.controls.employeeCount.value.trim();
    const n = raw ? Number(raw) : null;
    return n != null && Number.isFinite(n) ? n : null;
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
    const request: CreateProfileRequest = {
      registryCode: rc,
      website: this.form.controls.website.value || null,
      employeeCount: this.employeeCountValue(),
      operatingAddress: this.form.controls.operatingAddress.value || null,
      contacts: this.contactValues(),
      bankAccounts: this.bankAccountValues(),
      targetMarkets: this.form.controls.targetMarkets.value,
      operatingRegions: this.form.controls.operatingRegions.value,
    };
    this.createProfile.emit(request);
  }

  protected onSave(): void {
    if (!this.contactsValid()) {
      this.go(1);
      return;
    }
    const rc = this.profile()?.registryCode;
    if (!rc) {
      return;
    }
    // One PATCH with every user-owned field: the save is a single backend
    // transaction, so a validation failure can't leave a half-applied edit.
    // Cleared text fields are sent as '' (backend clears on blank).
    const body: StepUpdateRequest = {
      operatingAddress: this.form.controls.operatingAddress.value.trim(),
      website: this.form.controls.website.value.trim(),
      employeeCount: this.employeeCountValue(),
      contacts: this.contactValues(),
      targetMarkets: this.form.controls.targetMarkets.value,
      operatingRegions: this.form.controls.operatingRegions.value,
      bankAccounts: this.bankAccountValues(),
    };
    this.editSaving.set(true);
    this.editError.set(null);
    this.api
      .updateStep(rc, this.activeStep() + 1, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.editSaving.set(false);
          this.editError.set('Salvestamine ebaõnnestus. Proovi uuesti.');
        },
        complete: () => {
          this.editSaving.set(false);
          this.saved.emit();
        },
      });
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
    return `${value < 0 ? '−' : ''}${abs} EUR`;
  }
}
