import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DdsBadge, DdsButton, DdsCompleteness, DdsContactBlock, DdsIcon } from '@dds/ui';
import { ProfileView } from '../../models/profile.models';
import {
  OPERATING_REGIONS,
  TARGET_MARKETS,
  formatEstonianDate,
  labelFor,
} from '../../models/vocabulary';

@Component({
  selector: 'app-profile-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DdsButton, DdsBadge, DdsContactBlock, DdsCompleteness, DdsIcon],
  templateUrl: './profile-overview.html',
  styleUrl: './profile-overview.scss',
})
export class ProfileOverview {
  readonly profile = input.required<ProfileView>();
  readonly unavailable = input(false);
  readonly unavailableMessage = input<string | null>(null);

  readonly edit = output<void>();
  readonly refresh = output<void>();

  protected readonly asOf = computed(() => formatEstonianDate(this.profile().dataAsOfDate));

  protected readonly primaryContact = computed(
    () => this.profile().contacts.find((c) => c.primary) ?? this.profile().contacts[0] ?? null,
  );

  protected readonly legalAddress = computed(
    () =>
      this.profile().addresses.find((a) => a.addressType === 'LEGAL')?.fullAddress ??
      this.profile().addresses[0]?.fullAddress ??
      null,
  );

  protected readonly emtak = computed(() => {
    const p = this.profile();
    return p.emtakName.value ? `${p.emtakCode.value} — ${p.emtakName.value}` : p.emtakCode.value;
  });

  protected readonly marketLabels = computed(() =>
    this.profile().cards.targetMarkets.map((c) => labelFor(TARGET_MARKETS, c)),
  );
  protected readonly regionLabels = computed(() =>
    this.profile().cards.operatingRegions.map((c) => labelFor(OPERATING_REGIONS, c)),
  );

  protected readonly latestReport = computed(() => this.profile().annualReports[0] ?? null);

  /** Horizontal-bar data for the Müügitulu chart (widths relative to the max). */
  protected readonly revenueBars = computed(() => {
    const rows = this.profile().annualReports;
    const max = Math.max(1, ...rows.map((r) => r.salesRevenueEstonia ?? 0));
    return rows
      .slice()
      .sort((a, b) => a.reportYear - b.reportYear)
      .map((r) => ({
        year: r.reportYear,
        pct: Math.round(((r.salesRevenueEstonia ?? 0) / max) * 100),
        label: this.millions(r.salesRevenueEstonia),
      }));
  });

  protected money(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '—';
    }
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private millions(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '—';
    }
    return `${new Intl.NumberFormat('et-EE', { maximumFractionDigits: 1 }).format(value / 1_000_000)}M €`;
  }
}
