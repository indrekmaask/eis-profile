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

interface PartyRoleGroup {
  role: string;
  heading: string;
  isOwner: boolean;
  rows: { displayName: string; subtypeLabel: string; pct: string | null }[];
}

const ROLE_HEADINGS: Record<string, string> = {
  Osanik: 'Osanikud',
  Kasusaaja: 'Kasusaajad',
  'Juhatuse liige': 'Juhatuse liige',
  Asutaja: 'Asutajad',
  'Osade registripidaja': 'Osade registripidaja',
};

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

  protected readonly asOfDateTime = computed(() => {
    const iso = this.profile().dataAsOfDate;
    if (!iso) {
      return '—';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    return new Intl.DateTimeFormat('et-EE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(d).replace(',', '');
  });

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

  protected readonly partiesByRole = computed<PartyRoleGroup[]>(() => {
    const order: string[] = [];
    const map = new Map<string, PartyRoleGroup>();
    for (const rp of this.profile().relatedParties) {
      let g = map.get(rp.role);
      if (!g) {
        g = {
          role: rp.role,
          heading: ROLE_HEADINGS[rp.role] ?? rp.role,
          isOwner: rp.role === 'Osanik',
          rows: [],
        };
        map.set(rp.role, g);
        order.push(rp.role);
      }
      g.rows.push({
        displayName: rp.displayName,
        subtypeLabel: `${this.partyTypeLabel(rp.partyType)}: ${rp.registryCode}`,
        pct: g.isOwner && rp.ownershipPct != null ? `${this.pct(rp.ownershipPct)}%` : null,
      });
    }
    return order.map((r) => map.get(r)!);
  });

  protected partyTypeLabel(partyType: string | null): string {
    return this.isNatural(partyType) ? 'Füüsiline isik' : 'Juriidiline isik';
  }

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
