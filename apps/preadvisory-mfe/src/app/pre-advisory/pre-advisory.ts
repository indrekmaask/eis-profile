import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DdsButton, DdsCard } from '@dds/ui';
import { ProfileApiService, ProfileView } from '@eis/profile-api';

const MARKET_LABELS: Record<string, string> = {
  EE: 'Eesti', FI: 'Soome', SE: 'Rootsi', LV: 'Läti', LT: 'Leedu', NO: 'Norra',
  DK: 'Taani', DE: 'Saksamaa', PL: 'Poola', NL: 'Holland', FR: 'Prantsusmaa',
  GB: 'Ühendkuningriik', US: 'Ameerika Ühendriigid',
};

function exportRevenue(r: { salesRevenueEu: number | null; salesRevenueNonEu: number | null }): number {
  return (r.salesRevenueEu ?? 0) + (r.salesRevenueNonEu ?? 0);
}

function money(v: number | null | undefined): string {
  if (v == null) {
    return '—';
  }
  return new Intl.NumberFormat('et-EE', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(v);
}

@Component({
  selector: 'app-pre-advisory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DdsButton, DdsCard],
  templateUrl: './pre-advisory.html',
  styleUrl: './pre-advisory.scss',
})
export class PreAdvisory {
  private readonly api = inject(ProfileApiService);
  private readonly router = inject(Router);

  // MF remote: the shell passes the active company via the ?rc= query param
  // (no shared IdentityService), same contract as the profile remote.
  protected readonly registryCode = signal<string | null>(null);
  protected readonly profile = signal<ProfileView | null>(null);
  protected readonly done = signal(false);
  protected readonly submitAttempted = signal(false);

  protected readonly participant = new FormControl('', { nonNullable: true });

  protected readonly exportLabel = computed(() => {
    const r = this.profile()?.annualReports[0];
    return r ? money(exportRevenue(r)) : '—';
  });

  protected readonly marketsLabel = computed(() => {
    const codes = this.profile()?.cards.targetMarkets ?? [];
    return codes.length ? codes.map((c) => MARKET_LABELS[c] ?? c).join(', ') : '—';
  });

  constructor() {
    const rc = new URLSearchParams(window.location.search).get('rc');
    this.registryCode.set(rc);
    if (rc) {
      this.api.getProfile(rc).subscribe((p) => this.profile.set(p));
    }
  }

  protected submit(): void {
    this.submitAttempted.set(true);
    if (!this.participant.value) {
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
