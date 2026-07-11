import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DdsButton,
  DdsCard,
  DdsInput,
  DdsPhoneInput,
  DdsRegistryField,
  DdsRegistryProvenance,
  DdsStep,
  DdsStepper,
  DdsTagInput,
} from '@dds/ui';
import {
  CreateProfileRequest,
  PrefillView,
  ProfileView,
  StepUpdateRequest,
} from '../../models/profile.models';
import { OPERATING_REGIONS, TARGET_MARKETS, formatEstonianDate } from '../../models/vocabulary';

type ContactGroup = FormGroup<{
  fullName: FormControl<string>;
  role: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  personCode: FormControl<string>;
  primary: FormControl<boolean>;
}>;

type BankGroup = FormGroup<{
  iban: FormControl<string>;
  bankName: FormControl<string>;
  primary: FormControl<boolean>;
}>;

/** PATCH step numbers per stepper index; index 2 (related parties) is display-only. */
const STEP_NUMBER: Record<number, number> = { 0: 1, 1: 2, 3: 4 };

@Component({
  selector: 'app-profile-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DdsButton,
    DdsCard,
    DdsInput,
    DdsPhoneInput,
    DdsRegistryField,
    DdsRegistryProvenance,
    DdsStepper,
    DdsTagInput,
  ],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss',
})
export class ProfileEdit {
  readonly mode = input.required<'create' | 'edit'>();
  readonly profile = input<ProfileView | null>(null);
  readonly prefill = input<PrefillView | null>(null);
  readonly saving = input(false);

  readonly saveStep = output<{ step: number; body: StepUpdateRequest }>();
  readonly createProfile = output<CreateProfileRequest>();
  readonly cancel = output<void>();
  readonly refresh = output<void>();

  protected readonly markets = TARGET_MARKETS;
  protected readonly regions = OPERATING_REGIONS;
  protected readonly steps: DdsStep[] = [
    { label: 'Üldandmed' },
    { label: 'Kontaktandmed' },
    { label: 'Seotud isikud' },
    { label: 'Muu' },
  ];
  protected readonly activeStep = signal(0);
  protected readonly showWebsite = signal(false);

  protected readonly form = new FormGroup({
    employeeCount: new FormControl('', { nonNullable: true }),
    website: new FormControl('', { nonNullable: true }),
    operatingAddress: new FormControl('', { nonNullable: true }),
    contacts: new FormArray<ContactGroup>([]),
    bankAccounts: new FormArray<BankGroup>([]),
    targetMarkets: new FormControl<string[]>([], { nonNullable: true }),
    operatingRegions: new FormControl<string[]>([], { nonNullable: true }),
  });

  /** Register-owned header fields, from prefill (create) or the stored profile (edit). */
  protected readonly header = computed(() => {
    const pf = this.prefill();
    const p = this.profile();
    if (pf) {
      return {
        businessName: pf.businessName,
        legalForm: pf.legalForm,
        emtak: pf.emtakName ? `${pf.emtakName} (${pf.emtakCode})` : null,
        legalAddress: pf.legalAddress,
        dataAsOfDate: formatEstonianDate(pf.dataAsOfDate),
        registryCode: pf.registryCode,
      };
    }
    if (p) {
      return {
        businessName: p.businessName.value,
        legalForm: p.legalForm.value,
        emtak: p.emtakName.value ? `${p.emtakName.value} (${p.emtakCode.value})` : null,
        legalAddress: p.addresses.find((a) => a.addressType === 'LEGAL')?.fullAddress ?? null,
        dataAsOfDate: formatEstonianDate(p.dataAsOfDate),
        registryCode: p.registryCode,
      };
    }
    return null;
  });

  protected readonly relatedParties = computed(
    () => this.profile()?.relatedParties ?? this.prefill()?.relatedParties ?? [],
  );

  private seeded = false;

  constructor() {
    effect(() => {
      // Seed the form once from whichever source is present.
      const p = this.profile();
      const pf = this.prefill();
      if (this.seeded || (!p && !pf)) {
        return;
      }
      this.seeded = true;
      if (p) {
        this.seedFromProfile(p);
      }
      this.showWebsite.set(!!this.form.controls.website.value);
    });
  }

  get contacts(): FormArray<ContactGroup> {
    return this.form.controls.contacts;
  }
  get bankAccounts(): FormArray<BankGroup> {
    return this.form.controls.bankAccounts;
  }

  private seedFromProfile(p: ProfileView): void {
    this.form.patchValue({
      employeeCount: p.employeeCount.value != null ? String(p.employeeCount.value) : '',
      website: p.website.value ?? '',
      operatingAddress: p.addresses.find((a) => a.addressType === 'OPERATING')?.fullAddress ?? '',
      targetMarkets: p.cards.targetMarkets ?? [],
      operatingRegions: p.cards.operatingRegions ?? [],
    });
    p.contacts.forEach((c) =>
      this.contacts.push(
        this.contactGroup({
          fullName: c.fullName ?? '',
          role: c.role ?? '',
          email: c.email ?? '',
          phone: c.phone ?? '',
          personCode: c.personCode ?? '',
          primary: c.primary,
        }),
      ),
    );
    p.bankAccounts.forEach((b) =>
      this.bankAccounts.push(
        this.bankGroup({ iban: b.iban, bankName: b.bankName ?? '', primary: b.primary }),
      ),
    );
  }

  private contactGroup(v?: Partial<Record<string, string | boolean>>): ContactGroup {
    return new FormGroup({
      fullName: new FormControl(String(v?.['fullName'] ?? ''), { nonNullable: true }),
      role: new FormControl(String(v?.['role'] ?? ''), { nonNullable: true }),
      email: new FormControl(String(v?.['email'] ?? ''), {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phone: new FormControl(String(v?.['phone'] ?? ''), {
        nonNullable: true,
        validators: [Validators.required],
      }),
      personCode: new FormControl(String(v?.['personCode'] ?? ''), { nonNullable: true }),
      primary: new FormControl(Boolean(v?.['primary'] ?? false), { nonNullable: true }),
    });
  }

  private bankGroup(v?: { iban?: string; bankName?: string; primary?: boolean }): BankGroup {
    return new FormGroup({
      iban: new FormControl(v?.iban ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      bankName: new FormControl(v?.bankName ?? '', { nonNullable: true }),
      primary: new FormControl(v?.primary ?? false, { nonNullable: true }),
    });
  }

  protected addContact(): void {
    this.contacts.push(this.contactGroup({ primary: this.contacts.length === 0 }));
  }
  protected removeContact(i: number): void {
    this.contacts.removeAt(i);
  }
  protected addBank(): void {
    this.bankAccounts.push(this.bankGroup({ primary: this.bankAccounts.length === 0 }));
  }
  protected removeBank(i: number): void {
    this.bankAccounts.removeAt(i);
  }

  protected revealWebsite(): void {
    this.showWebsite.set(true);
  }

  protected go(i: number): void {
    this.activeStep.set(Math.max(0, Math.min(this.steps.length - 1, i)));
  }
  protected next(): void {
    this.go(this.activeStep() + 1);
  }
  protected prev(): void {
    this.go(this.activeStep() - 1);
  }

  protected readonly isLastStep = computed(() => this.activeStep() === this.steps.length - 1);
  protected readonly canSaveStep = computed(() => STEP_NUMBER[this.activeStep()] !== undefined);

  protected onSaveStep(): void {
    const step = STEP_NUMBER[this.activeStep()];
    if (step === undefined) {
      return;
    }
    if (step === 2 && (this.contacts.invalid || this.bankAccounts.invalid)) {
      this.form.markAllAsTouched();
      return;
    }
    this.saveStep.emit({ step, body: this.stepBody(step) });
  }

  private stepBody(step: number): StepUpdateRequest {
    switch (step) {
      case 1:
        return {
          employeeCount: this.employeeCountValue(),
          website: this.form.controls.website.value || null,
          operatingAddress: this.form.controls.operatingAddress.value || null,
        };
      case 2:
        return { contacts: this.contactInputs(), bankAccounts: this.bankInputs() };
      case 4:
        return {
          targetMarkets: this.form.controls.targetMarkets.value,
          operatingRegions: this.form.controls.operatingRegions.value,
        };
      default:
        return {};
    }
  }

  protected onCreate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const rc = this.header()?.registryCode;
    if (!rc) {
      return;
    }
    const request: CreateProfileRequest = {
      registryCode: rc,
      website: this.form.controls.website.value || null,
      employeeCount: this.employeeCountValue(),
      operatingAddress: this.form.controls.operatingAddress.value || null,
      contacts: this.contactInputs(),
      bankAccounts: this.bankInputs(),
      targetMarkets: this.form.controls.targetMarkets.value,
      operatingRegions: this.form.controls.operatingRegions.value,
    };
    this.createProfile.emit(request);
  }

  private employeeCountValue(): number | null {
    const raw = this.form.controls.employeeCount.value.trim();
    if (!raw) {
      return null;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  private contactInputs() {
    return this.contacts.controls.map((g) => ({
      fullName: g.controls.fullName.value,
      role: g.controls.role.value || null,
      email: g.controls.email.value || null,
      phone: g.controls.phone.value || null,
      personCode: g.controls.personCode.value || null,
      primary: g.controls.primary.value,
    }));
  }

  private bankInputs() {
    return this.bankAccounts.controls.map((g) => ({
      iban: g.controls.iban.value,
      bankName: g.controls.bankName.value || null,
      primary: g.controls.primary.value,
    }));
  }

  protected showError(control: { invalid: boolean; touched: boolean }): boolean {
    return control.invalid && control.touched;
  }
}
