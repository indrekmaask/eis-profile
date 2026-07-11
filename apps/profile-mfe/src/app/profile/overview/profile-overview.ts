import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  DdsBadge,
  DdsButton,
  DdsCard,
  DdsCompleteness,
  DdsContactBlock,
  DdsRegistryField,
  DdsRegistryProvenance,
} from '@dds/ui';
import { ProfileView } from '../../models/profile.models';
import { formatEstonianDate } from '../../models/vocabulary';

/** Estonian labels for the completeness "missing" field keys. */
const MISSING_LABELS: Record<string, string> = {
  website: 'Veebileht',
  employeeCount: 'Töötajate arv',
  contact: 'Kontaktisik',
  bankAccount: 'Pangakonto',
  targetMarkets: 'Sihtturud',
  operatingRegions: 'Tegevuspiirkond',
};

@Component({
  selector: 'app-profile-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DdsButton,
    DdsCard,
    DdsBadge,
    DdsContactBlock,
    DdsRegistryField,
    DdsRegistryProvenance,
    DdsCompleteness,
  ],
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

  protected readonly missingLabels = computed(() =>
    this.profile().completeness.missing.map((k) => MISSING_LABELS[k] ?? k),
  );

  protected readonly primaryContact = computed(
    () => this.profile().contacts.find((c) => c.primary) ?? this.profile().contacts[0] ?? null,
  );

  protected readonly legalAddress = computed(
    () =>
      this.profile().addresses.find((a) => a.addressType === 'LEGAL')?.fullAddress ??
      this.profile().addresses[0]?.fullAddress ??
      null,
  );

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

  protected marketList(): string {
    const m = this.profile().cards.targetMarkets;
    return m.length ? m.join(', ') : '—';
  }

  protected regionList(): string {
    const r = this.profile().cards.operatingRegions;
    return r.length ? r.join(', ') : '—';
  }
}
