import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DdsBadge, DdsButton, DdsCard, DdsDropdown, DdsInput, DdsOption } from '@dds/ui';
import { ProfileApiService, ProfileView, derivePersonInfo } from '@eis/profile-api';
import { IdentityService } from '../identity/identity.service';

/**
 * Development-programme pre-advisory (P5-4). Contact picker (primary preselected);
 * the contact's birth date is DERIVED from the ID code client-side (not fetched).
 * Clear boundary: profile-sourced fields vs. what the user types manually.
 */
@Component({
  selector: 'app-pre-advisory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DdsBadge, DdsButton, DdsCard, DdsDropdown, DdsInput],
  template: `
    <div class="adv">
      <span class="adv__eyebrow">Arenguprogramm · eelnõustamine</span>
      <h1>Broneeri eelnõustamine</h1>

      @if (!identity.activeCompany()) {
        <dds-card heading="Vali esmalt ettevõte">
          <button dds-button variant="primary" size="sm" (click)="toRoles()">Vali roll</button>
        </dds-card>
      } @else if (profile(); as p) {
        <dds-card heading="Profiilist (ei pea uuesti sisestama)">
          <div class="adv__row"><span>Ettevõte</span><span>{{ p.businessName.value }}</span></div>
          <div class="adv__row"><span>Töötajate arv</span><span>{{ p.employeeCount.value ?? '—' }}</span></div>
          <div class="adv__row"><span>Sihtturud</span><span>{{ p.cards.targetMarkets.join(', ') || '—' }}</span></div>
        </dds-card>

        <dds-card heading="Kontaktisik">
          <dds-badge tone="info">Profiilist</dds-badge>
          @if (contactOptions().length) {
            <div class="adv__field">
              <dds-dropdown
                label="Vali kontaktisik"
                [options]="contactOptions()"
                [formControl]="selectedContact"
              />
            </div>
            @if (selectedInfo(); as info) {
              <p class="adv__derived">
                Sünniaeg <strong>{{ info.birthDateDisplay }}</strong> · sugu {{ info.sex }}
                <dds-badge tone="neutral">Tuletatud isikukoodist</dds-badge>
              </p>
            } @else {
              <p class="adv__muted">Valitud kontaktil pole profiilis isikukoodi — sünniaega ei saa tuletada.</p>
            }
          } @else {
            <p class="adv__muted">Profiilis pole kontaktisikuid.</p>
          }
        </dds-card>

        <dds-card heading="Käsitsi täidetav">
          <dds-badge tone="warning">Ei tule profiilist</dds-badge>
          <div class="adv__field">
            <dds-input
              label="Nõustamise eesmärk"
              description="Kirjelda, mida soovid programmilt"
              [formControl]="goal"
            />
          </div>
        </dds-card>

        @if (booked()) {
          <div class="adv__ok" role="status">✓ Eelnõustamine broneeritud (näidis).</div>
        } @else {
          <button dds-button variant="primary" (click)="book()">Broneeri</button>
        }
      } @else {
        <p>Laen profiili…</p>
      }
    </div>
  `,
  styles: [
    `
      .adv {
        max-width: var(--dds-width-form);
        margin: 0 auto;
        padding: var(--dds-space-6);
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-4);
        align-items: flex-start;
      }
      .adv__eyebrow {
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
      dds-card {
        width: 100%;
      }
      .adv__row {
        display: flex;
        justify-content: space-between;
        gap: var(--dds-space-4);
        padding: var(--dds-space-1) 0;
      }
      .adv__row span:first-child {
        color: var(--dds-color-ink-subtle);
      }
      .adv__field {
        margin-top: var(--dds-space-3);
        max-width: 360px;
      }
      .adv__derived {
        display: flex;
        align-items: center;
        gap: var(--dds-space-2);
        margin: var(--dds-space-3) 0 0;
        font-size: var(--dds-font-size-sm);
      }
      .adv__muted {
        color: var(--dds-color-ink-subtle);
        font-size: var(--dds-font-size-sm);
        margin: var(--dds-space-3) 0 0;
      }
      .adv__ok {
        background: var(--dds-color-success-bg);
        color: var(--dds-color-success);
        border-radius: var(--dds-radius-control);
        padding: var(--dds-space-3) var(--dds-space-4);
        font-weight: var(--dds-font-weight-medium);
      }
    `,
  ],
})
export class PreAdvisory {
  protected readonly identity = inject(IdentityService);
  private readonly api = inject(ProfileApiService);
  private readonly router = inject(Router);

  protected readonly profile = signal<ProfileView | null>(null);
  protected readonly selectedContact = new FormControl('', { nonNullable: true });
  protected readonly goal = new FormControl('', { nonNullable: true });
  protected readonly booked = signal(false);
  private readonly selectedContactId = signal('');

  protected readonly contactOptions = computed<DdsOption[]>(() =>
    (this.profile()?.contacts ?? []).map((c) => ({
      value: c.id,
      label: c.fullName + (c.primary ? ' (peamine)' : ''),
    })),
  );

  protected readonly selectedInfo = computed(() => {
    const p = this.profile();
    if (!p) {
      return null;
    }
    const contact = p.contacts.find((c) => c.id === this.selectedContactId());
    return derivePersonInfo(contact?.personCode);
  });

  constructor() {
    const company = this.identity.activeCompany();
    if (company) {
      this.api.getProfile(company.registryCode).subscribe((p) => {
        this.profile.set(p);
        const primary = p.contacts.find((c) => c.primary) ?? p.contacts[0];
        if (primary) {
          this.selectedContact.setValue(primary.id);
          this.selectedContactId.set(primary.id);
        }
      });
    }
    this.selectedContact.valueChanges.subscribe((v) => this.selectedContactId.set(v ?? ''));
  }

  protected book(): void {
    this.booked.set(true);
  }
  protected toRoles(): void {
    this.router.navigate(['/select-role']);
  }
}
