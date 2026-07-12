import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DdsBadge, DdsButton, DdsCard, DdsRegistryField } from '@dds/ui';
import { ProfileApiService, ProfileView } from '@eis/profile-api';
import { IdentityService } from '../identity/identity.service';

/**
 * Once-only reuse (P5-3): a service application pre-filled entirely from the saved
 * profile. The applicant re-enters nothing — every field is "Eeltäidetud profiilist".
 */
@Component({
  selector: 'app-service-application',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DdsBadge, DdsButton, DdsCard, DdsRegistryField],
  template: `
    <div class="svc">
      <span class="svc__eyebrow">Teenus · toetuse taotlus</span>
      <h1>Ekspordi toetuse taotlus</h1>

      @if (!identity.activeCompany()) {
        <dds-card heading="Vali esmalt ettevõte">
          <p class="svc__muted">Once-only täitmiseks vali roll (ettevõte).</p>
          <button dds-button variant="primary" size="sm" (click)="toRoles()">Vali roll</button>
        </dds-card>
      } @else if (profile(); as p) {
        <div class="svc__banner">
          <dds-badge tone="info">Eeltäidetud profiilist</dds-badge>
          Kõik andmed on võetud ettevõtte profiilist — midagi ei pea uuesti sisestama.
        </div>

        <dds-card heading="Taotleja">
          <div class="svc__grid">
            <dds-registry-field label="Ettevõte" [value]="p.businessName.value" />
            <dds-registry-field label="Registrikood" [value]="p.registryCode" />
            <dds-registry-field label="E-post" [value]="primaryEmail(p)" />
            <dds-registry-field label="Telefon" [value]="primaryPhone(p)" />
            <dds-registry-field label="Aadress" [value]="legalAddress(p)" />
            <dds-registry-field label="Töötajate arv" [value]="text(p.employeeCount.value)" />
          </div>
        </dds-card>

        <dds-card heading="Ekspordi sihtturud (profiilist)">
          @if (p.cards.targetMarkets.length) {
            <p>{{ p.cards.targetMarkets.join(', ') }}</p>
          } @else {
            <p class="svc__muted">Sihtturud pole profiilis määratud — täienda profiili.</p>
          }
        </dds-card>

        @if (submitted()) {
          <div class="svc__ok" role="status">✓ Taotlus esitatud (näidis). Andmed võeti profiilist.</div>
        } @else {
          <button dds-button variant="primary" (click)="submit()">Esita taotlus</button>
        }
      } @else {
        <p>Laen profiili…</p>
      }
    </div>
  `,
  styles: [
    `
      .svc {
        max-width: var(--dds-width-block);
        margin: 0 auto;
        padding: var(--dds-space-6);
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-4);
        align-items: flex-start;
      }
      .svc__eyebrow {
        font-size: var(--dds-font-size-xs);
        font-weight: var(--dds-font-weight-bold);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--dds-color-primary);
      }
      h1 {
        margin: 0;
        font-size: var(--dds-font-size-xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .svc__banner {
        display: flex;
        align-items: center;
        gap: var(--dds-space-3);
        background: var(--dds-color-registry-highlight);
        color: var(--dds-color-registry-accent);
        border-radius: var(--dds-radius-control);
        padding: var(--dds-space-3) var(--dds-space-4);
        font-size: var(--dds-font-size-sm);
      }
      .svc__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--dds-space-3);
        width: 100%;
      }
      dds-card {
        width: 100%;
      }
      .svc__muted {
        color: var(--dds-color-ink-subtle);
        font-size: var(--dds-font-size-sm);
        margin: 0 0 var(--dds-space-3);
      }
      .svc__ok {
        background: var(--dds-color-success-bg);
        color: var(--dds-color-success);
        border-radius: var(--dds-radius-control);
        padding: var(--dds-space-3) var(--dds-space-4);
        font-weight: var(--dds-font-weight-medium);
      }
    `,
  ],
})
export class ServiceApplication {
  protected readonly identity = inject(IdentityService);
  private readonly api = inject(ProfileApiService);
  private readonly router = inject(Router);

  protected readonly profile = signal<ProfileView | null>(null);
  protected readonly submitted = signal(false);

  constructor() {
    const company = this.identity.activeCompany();
    if (company) {
      this.api.getProfile(company.registryCode).subscribe((p) => this.profile.set(p));
    }
  }

  protected primaryEmail(p: ProfileView): string | null {
    return (p.contacts.find((c) => c.primary) ?? p.contacts[0])?.email ?? null;
  }
  protected primaryPhone(p: ProfileView): string | null {
    return (p.contacts.find((c) => c.primary) ?? p.contacts[0])?.phone ?? null;
  }
  protected legalAddress(p: ProfileView): string | null {
    return p.addresses.find((a) => a.addressType === 'LEGAL')?.fullAddress ?? p.addresses[0]?.fullAddress ?? null;
  }
  protected text(v: number | null): string | null {
    return v == null ? null : String(v);
  }
  protected submit(): void {
    this.submitted.set(true);
  }
  protected toRoles(): void {
    this.router.navigate(['/select-role']);
  }
}
