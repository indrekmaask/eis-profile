import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DdsButton, DdsCard } from '@dds/ui';
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
  imports: [ReactiveFormsModule, RouterLink, DdsButton, DdsCard],
  templateUrl: './pre-advisory.html',
  styleUrl: './pre-advisory.scss',
})
export class PreAdvisory {
  protected readonly identity = inject(IdentityService);
  private readonly api = inject(ProfileApiService);
  private readonly router = inject(Router);

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
    const company = this.identity.activeCompany();
    if (company) {
      this.api.getProfile(company.registryCode).subscribe((p) => this.profile.set(p));
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
