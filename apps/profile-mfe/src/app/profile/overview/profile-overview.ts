import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DdsButton, DdsIcon, DdsInput, DdsPhoneInput, DdsTagInput } from '@dds/ui';
import { derivePersonInfo } from '@eis/profile-api';
import { ProfileView, StepUpdateRequest } from '../../models/profile.models';
import { TARGET_MARKETS, formatEstonianDate, labelFor } from '../../models/vocabulary';

type ContactGroup = FormGroup<{
  fullName: FormControl<string>;
  role: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  personCode: FormControl<string>;
  primary: FormControl<boolean>;
}>;

type Section = 'general' | 'contacts' | 'other';

interface PartyGroup {
  displayName: string;
  partyType: string | null;
  registryCode: string | null;
  roles: string[];
}

/** Profile overview per the v22 flows: locked registry sections, per-section editing. */
@Component({
  selector: 'app-profile-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DdsButton, DdsIcon, DdsInput, DdsPhoneInput, DdsTagInput],
  templateUrl: './profile-overview.html',
  styleUrl: './profile-overview.scss',
})
export class ProfileOverview {
  readonly profile = input.required<ProfileView>();
  readonly unavailable = input(false);
  readonly unavailableMessage = input<string | null>(null);
  readonly saving = input(false);

  readonly saveSection = output<{ step: number; body: StepUpdateRequest }>();
  readonly refresh = output<void>();

  protected readonly markets = TARGET_MARKETS;
  protected readonly editing = signal<Section | null>(null);
  protected readonly partiesOpen = signal(false);

  protected readonly asOf = computed(() => formatEstonianDate(this.profile().dataAsOfDate));

  protected readonly legalAddress = computed(
    () => this.profile().addresses.find((a) => a.addressType === 'LEGAL')?.fullAddress ?? null,
  );
  protected readonly operatingAddress = computed(
    () => this.profile().addresses.find((a) => a.addressType === 'OPERATING')?.fullAddress ?? null,
  );

  protected readonly emtak = computed(() => {
    const p = this.profile();
    return p.emtakName.value ? `${p.emtakCode.value} — ${p.emtakName.value}` : p.emtakCode.value;
  });

  protected readonly marketLabels = computed(() =>
    this.profile().cards.targetMarkets.map((c) => labelFor(TARGET_MARKETS, c)),
  );

  /** Related parties grouped per person/company, roles as pills (PDF modal + card). */
  protected readonly partyGroups = computed<PartyGroup[]>(() => {
    const groups = new Map<string, PartyGroup>();
    for (const rp of this.profile().relatedParties) {
      const key = rp.registryCode ?? rp.displayName;
      const g = groups.get(key) ?? {
        displayName: rp.displayName,
        partyType: rp.partyType,
        registryCode: rp.registryCode,
        roles: [],
      };
      g.roles.push(rp.ownershipPct != null ? `${rp.role} (${this.pct(rp.ownershipPct)}%)` : rp.role);
      groups.set(key, g);
    }
    return [...groups.values()];
  });

  protected readonly naturalCount = computed(
    () => this.partyGroups().filter((g) => this.isNatural(g.partyType)).length,
  );
  protected readonly legalCount = computed(
    () => this.partyGroups().filter((g) => !this.isNatural(g.partyType)).length,
  );

  protected readonly latestReport = computed(() => this.profile().annualReports[0] ?? null);

  /** Vertical-column data for the Müügitulu areng chart (totals incl. export). */
  protected readonly revenueColumns = computed(() => {
    const rows = this.profile().annualReports;
    const max = Math.max(1, ...rows.map((r) => this.totalRevenue(r)));
    return rows
      .slice()
      .sort((a, b) => a.reportYear - b.reportYear)
      .map((r) => ({
        year: r.reportYear,
        pct: Math.round((this.totalRevenue(r) / max) * 100),
      }));
  });

  /** Revenue growth (totals) between the last two years; null with fewer than 2 reports. */
  protected readonly growth = computed(() => {
    const rows = this.profile()
      .annualReports.slice()
      .sort((a, b) => b.reportYear - a.reportYear);
    if (rows.length < 2) {
      return null;
    }
    const prev = this.totalRevenue(rows[1]);
    if (!prev) {
      return null;
    }
    return ((this.totalRevenue(rows[0]) - prev) / prev) * 100;
  });

  protected readonly growthLabel = computed(() => {
    const g = this.growth();
    if (g == null) {
      return '—';
    }
    return `${g >= 0 ? '+' : '−'}${Math.abs(g).toFixed(1)}%`;
  });

  // --- section edit forms -----------------------------------------------

  protected readonly generalForm = new FormGroup({
    operatingAddress: new FormControl('', { nonNullable: true }),
    website: new FormControl('', { nonNullable: true }),
  });

  protected readonly contactForms = new FormArray<ContactGroup>([]);

  protected readonly otherForm = new FormGroup({
    employeeCount: new FormControl('', { nonNullable: true }),
    targetMarkets: new FormControl<string[]>([], { nonNullable: true }),
  });

  protected open(section: Section): void {
    const p = this.profile();
    if (section === 'general') {
      this.generalForm.setValue({
        operatingAddress: this.operatingAddress() ?? '',
        website: p.website.value ?? '',
      });
    } else if (section === 'contacts') {
      this.contactForms.clear();
      p.contacts.forEach((c) =>
        this.contactForms.push(
          this.contactGroup(c.fullName, c.role ?? '', c.email ?? '', c.phone ?? '', c.personCode ?? '', c.primary),
        ),
      );
    } else {
      this.otherForm.setValue({
        employeeCount: p.employeeCount.value != null ? String(p.employeeCount.value) : '',
        targetMarkets: [...p.cards.targetMarkets],
      });
    }
    this.editing.set(section);
  }

  protected close(): void {
    this.editing.set(null);
  }

  protected saveGeneral(): void {
    this.saveSection.emit({
      step: 1,
      body: {
        operatingAddress: this.generalForm.controls.operatingAddress.value || null,
        website: this.generalForm.controls.website.value || null,
      },
    });
    this.close();
  }

  protected saveContacts(): void {
    if (this.contactForms.invalid) {
      this.contactForms.markAllAsTouched();
      return;
    }
    this.saveSection.emit({
      step: 2,
      body: {
        contacts: this.contactForms.controls.map((g) => ({
          fullName: g.controls.fullName.value,
          role: g.controls.role.value || null,
          email: g.controls.email.value || null,
          phone: g.controls.phone.value || null,
          personCode: g.controls.personCode.value || null,
          primary: g.controls.primary.value,
        })),
      },
    });
    this.close();
  }

  protected saveOther(): void {
    const raw = this.otherForm.controls.employeeCount.value.trim();
    const n = raw ? Number(raw) : null;
    this.saveSection.emit({
      step: 4,
      body: {
        employeeCount: n != null && Number.isFinite(n) ? n : null,
        targetMarkets: this.otherForm.controls.targetMarkets.value,
      },
    });
    this.close();
  }

  protected addContact(): void {
    this.contactForms.push(this.contactGroup('', '', '', '', '', this.contactForms.length === 0));
  }
  protected removeContact(i: number): void {
    this.contactForms.removeAt(i);
  }
  protected setPrimary(i: number): void {
    this.contactForms.controls.forEach((g, idx) => g.controls.primary.setValue(idx === i));
  }

  private contactGroup(
    fullName: string,
    role: string,
    email: string,
    phone: string,
    personCode: string,
    primary: boolean,
  ): ContactGroup {
    return new FormGroup({
      fullName: new FormControl(fullName, { nonNullable: true, validators: [Validators.required] }),
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

  // --- helpers ------------------------------------------------------------

  protected isNatural(partyType: string | null): boolean {
    return partyType === 'NATURAL' || partyType === 'Füüsiline isik';
  }

  /** Birth date derived from the person code, without leading zeroes (e.g. "9.10.1975"). */
  protected birthLabel(personCode: string | null | undefined): string | null {
    const info = derivePersonInfo(personCode ?? '');
    return info ? info.birthDateDisplay.replace(/(^|\.)0/g, '$1') : null;
  }

  protected totalRevenue(r: {
    salesRevenueEstonia: number | null;
    salesRevenueEu: number | null;
    salesRevenueNonEu: number | null;
  }): number {
    return (r.salesRevenueEstonia ?? 0) + (r.salesRevenueEu ?? 0) + (r.salesRevenueNonEu ?? 0);
  }

  protected exportRevenue(r: {
    salesRevenueEu: number | null;
    salesRevenueNonEu: number | null;
  }): number {
    return (r.salesRevenueEu ?? 0) + (r.salesRevenueNonEu ?? 0);
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

  protected pct(value: number): string {
    return new Intl.NumberFormat('et-EE', { maximumFractionDigits: 2 }).format(value);
  }

  protected showError(control: { invalid: boolean; touched: boolean }): boolean {
    return control.invalid && control.touched;
  }
}
