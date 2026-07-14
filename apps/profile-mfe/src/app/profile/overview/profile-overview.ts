import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DdsButton, DdsIcon } from '@dds/ui';
import { derivePersonInfo } from '@eis/profile-api';
import { ProfileView } from '../../models/profile.models';
import { TARGET_MARKETS, formatEstonianDate, labelFor } from '../../models/vocabulary';

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
  imports: [DdsButton, DdsIcon],
  templateUrl: './profile-overview.html',
  styleUrl: './profile-overview.scss',
})
export class ProfileOverview {
  readonly profile = input.required<ProfileView>();
  readonly unavailable = input(false);
  readonly unavailableMessage = input<string | null>(null);
  readonly saving = input(false);

  /** Which stepper step the overview asks to edit: general → 0, contacts → 1, other → 2. */
  readonly editRequested = output<number>();
  readonly refresh = output<void>();

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

  protected primaryContact() {
    const p = this.profile();
    return p.contacts.find((c) => c.primary) ?? p.contacts[0] ?? null;
  }

  protected missingLabels(): string {
    const map: Record<string, string> = {
      primaryContactEmail: 'kontakti e-post',
      primaryContactPhone: 'kontakti telefon',
      employeeCount: 'töötajate arv',
      marketRegion: 'sihtturud',
      website: 'veebileht',
    };
    return this.profile()
      .completeness.missing.map((m) => map[m] ?? m)
      .join(', ');
  }

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

  protected regionLabels(): string[] {
    return this.profile().cards.operatingRegions ?? [];
  }

  protected paymentLabel(): string {
    const p = this.profile();
    if (p.cards.paymentBehaviour) return p.cards.paymentBehaviour;
    return p.cards.taxDebt > 0 ? this.money(p.cards.taxDebt) : 'Väga hea';
  }

  protected revenueRows(): { year: number; pct: number; label: string }[] {
    const reports = [...this.profile().annualReports].sort((a, b) => b.reportYear - a.reportYear);
    const totals = reports.map((r) => ({ year: r.reportYear, total: this.totalRevenue(r) ?? 0 }));
    const max = Math.max(1, ...totals.map((t) => t.total));
    return totals.map((t) => ({
      year: t.year,
      pct: Math.round((t.total / max) * 100),
      label: `${(t.total / 1_000_000).toFixed(1).replace('.', ',')}M EUR`,
    }));
  }

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
    return `${value < 0 ? '−' : ''}${abs} EUR`;
  }

  protected pct(value: number): string {
    return new Intl.NumberFormat('et-EE', { maximumFractionDigits: 2 }).format(value);
  }
}
