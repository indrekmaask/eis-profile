import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DdsButton, DdsCard } from '@dds/ui';
import { AccessEntry, ProfileApiService } from '@eis/profile-api';
import { IdentityService } from './identity.service';

/** "Vali roll": lists companies the logged-in person may act for (via profile_access). */
@Component({
  selector: 'app-role-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DdsButton, DdsCard],
  template: `
    <div class="roles">
      <span class="roles__eyebrow">Vali roll</span>
      <h1>Kelle nimel tegutsed?</h1>
      @if (identity.info(); as info) {
        <p>Sisse logitud: {{ identity.personCode() }} · sünniaeg {{ info.birthDateDisplay }}</p>
      }

      @if (loading()) {
        <p>Laen ettevõtteid…</p>
      } @else if (entries().length) {
        <div class="roles__list">
          @for (e of entries(); track e.registryCode) {
            <dds-card [heading]="e.businessName">
              <p class="roles__muted">Registrikood {{ e.registryCode }} · roll: {{ e.accessRole }}</p>
              <button dds-button variant="primary" size="sm" (click)="choose(e)">
                Vali see ettevõte
              </button>
            </dds-card>
          }
        </div>
      } @else {
        <dds-card heading="Seotud ettevõtteid ei leitud">
          <p class="roles__muted">
            Sellel isikul ei ole registris seotud ettevõtteid. Proovi mõnda näidiskasutajat.
          </p>
          <button dds-button variant="secondary" size="sm" (click)="back()">Tagasi sisselogimisse</button>
        </dds-card>
      }
    </div>
  `,
  styles: [
    `
      .roles {
        max-width: var(--dds-width-form);
        margin: 0 auto;
        padding: var(--dds-space-6);
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-4);
        align-items: flex-start;
      }
      .roles__eyebrow {
        font-size: var(--dds-font-size-xs);
        font-weight: var(--dds-font-weight-bold);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--dds-color-primary);
      }
      h1 {
        margin: 0;
        font-size: var(--dds-font-size-lg);
        font-weight: var(--dds-font-weight-bold);
      }
      p {
        margin: 0;
        color: var(--dds-color-ink-muted);
      }
      .roles__list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-4);
      }
      .roles__muted {
        color: var(--dds-color-ink-subtle);
        font-size: var(--dds-font-size-sm);
        margin-bottom: var(--dds-space-3);
      }
    `,
  ],
})
export class RoleSelect {
  protected readonly identity = inject(IdentityService);
  private readonly api = inject(ProfileApiService);
  private readonly router = inject(Router);

  protected readonly entries = signal<AccessEntry[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    if (!this.identity.loggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.api.listAccess(this.identity.personCode()).subscribe({
      next: (list) => {
        this.entries.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected choose(e: AccessEntry): void {
    this.identity.selectCompany(e.registryCode, e.businessName);
    this.router.navigate(['/profiil'], {
      queryParams: { rc: e.registryCode, person: this.identity.personCode() },
    });
  }

  protected back(): void {
    this.router.navigate(['/']);
  }
}
