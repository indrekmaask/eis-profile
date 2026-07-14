import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DdsButton } from '@dds/ui';
import { ProfileApiService, ProfileView } from '@eis/profile-api';
import { IdentityService } from '../identity/identity.service';
import { SERVICES, evaluate } from './services.data';

/**
 * "Minu teenused" — available services computed from the company's profile,
 * laid out per the Figma frame: available-services cards + active-applications
 * empty state.
 */
@Component({
  selector: 'app-services-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DdsButton],
  template: `
    <div class="svc" [class.svc--empty]="showEmpty()">
      <nav class="svc__crumb">Peamine / Minu teenused</nav>
      <h1>Minu teenused</h1>

      @if (!identity.activeCompany()) {
        <div class="svc__empty">
          <p>Vali esmalt ettevõte, kelle nimel tegutsed.</p>
          <button dds-button variant="primary" size="sm" (click)="toRoles()">Vali roll</button>
        </div>
      } @else if (loading()) {
        <p class="svc__muted">Laen teenuseid…</p>
      } @else if (profileMissing()) {
        <div class="svc__empty">
          <span class="svc__ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M8 13h8" /><path d="M8 17h5" />
            </svg>
          </span>
          <h2>Koosta esmalt profiil</h2>
          <p>Kui profiil on olemas, saame arvutada, milliste teenuste jaoks kvalifitseerud.</p>
          <a dds-button variant="primary" routerLink="/profile" [queryParams]="createParams()">
            Koosta profiil →
          </a>
        </div>
      } @else {
        <p class="svc__lead">
          Eelhinnang arvutatakse {{ companyName() }} profiili ja aruannete andmetelt (seis
          {{ asOf() }}).<br />
          Kliki teenusel detailide ja taotlemise jaoks.
        </p>

        <h2 class="svc__section">Sulle saada olevad teenused</h2>
        <div class="svc__list">
          @for (s of services(); track s.id) {
            <a class="svc__row card" [routerLink]="['/services', s.id]">
              <span class="svc__ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 17l6-6 4 4 8-8" />
                  <path d="M14 7h7v7" />
                </svg>
              </span>
              <span class="svc__body">
                <span class="svc__name">{{ s.listTitle ?? s.name }}</span>
                <span class="svc__desc">{{ s.listIntro ?? s.intro }}</span>
              </span>
              <dds-button variant="pill" size="sm" class="svc__cta">Vaata lähemalt →</dds-button>
            </a>
          } @empty {
            <p class="svc__muted">
              Eelhinnangu põhjal ei sobi praegu ükski teenus — täienda profiili või pöördu
              kliendihalduri poole.
            </p>
          }
        </div>

        <h2 class="svc__section">Aktiivsed taotlused</h2>
        <div class="svc__row card svc__row--static">
          <span class="svc__ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 2v2" /><path d="M14 2v2" />
              <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
              <path d="M6 2v2" />
            </svg>
          </span>
          <span class="svc__body">
            <span class="svc__name">Aktiivseid teenuseid veel pole</span>
            <span class="svc__desc">Kui alustad teenuse kasutamist või esitad taotluse, ilmuvad need siia.</span>
          </span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .svc {
        max-width: var(--dds-width-block);
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-3);
      }
      .svc--empty {
        max-width: none;
      }
      .svc__crumb {
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      h1 {
        margin: 0;
        font-size: var(--dds-font-size-2xl);
        font-weight: var(--dds-font-weight-regular);
      }
      .svc__lead {
        margin: 0 0 var(--dds-space-2);
        max-width: 760px;
        color: var(--dds-color-ink-strong);
      }
      .svc__muted {
        color: var(--dds-color-ink-muted);
      }
      .svc__section {
        margin: var(--dds-space-4) 0 0;
        font-size: var(--dds-font-size-xl);
        font-weight: var(--dds-font-weight-regular);
      }
      .svc__list {
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-3);
      }
      .svc__row {
        display: flex;
        align-items: center;
        gap: var(--dds-space-5);
        background: var(--dds-color-surface);
        border-radius: var(--dds-radius-card);
        box-shadow: var(--dds-shadow-card);
        padding: var(--dds-space-5) var(--dds-space-6);
        text-decoration: none;
        color: var(--dds-color-ink-strong);
      }
      a.svc__row:hover {
        outline: 2px solid var(--dds-color-primary);
      }
      .svc__ico {
        width: 56px;
        height: 56px;
        flex: none;
        border: 1px solid var(--dds-color-ink-muted);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--dds-color-ink-muted);
      }
      .svc__ico svg {
        width: 26px;
        height: 26px;
      }
      .svc__body {
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-2);
        flex: 1;
        min-width: 0;
      }
      .svc__name {
        font-size: var(--dds-font-size-lg);
      }
      .svc__desc {
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
        max-width: 640px;
      }
      .svc__cta {
        flex: none;
      }
      .svc__empty {
        width: 100%;
        max-width: 720px;
        align-self: center;
        background: var(--dds-color-surface);
        border-radius: var(--dds-radius-card);
        box-shadow: var(--dds-shadow-card);
        padding: var(--dds-space-7) var(--dds-space-6);
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-3);
        align-items: center;
        text-align: center;
      }
      .svc__empty h2 {
        margin: 0;
        font-size: var(--dds-font-size-xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .svc__empty p {
        margin: 0;
        color: var(--dds-color-ink-muted);
      }
    `,
  ],
})
export class ServicesList {
  protected readonly identity = inject(IdentityService);
  private readonly api = inject(ProfileApiService);
  private readonly router = inject(Router);

  /** Only services whose automatic pre-check doesn't fail — the heading promises an eelhinnang. */
  protected readonly services = computed(() => {
    const p = this.profile();
    if (!p) {
      return [];
    }
    return SERVICES.filter((s) => evaluate(p, s).kind !== 'no');
  });
  protected readonly loading = signal(true);
  protected readonly profileMissing = signal(false);
  private readonly profile = signal<ProfileView | null>(null);

  /** No active company or no profile yet → centered empty card (matches the profile page). */
  protected readonly showEmpty = computed(
    () => !this.identity.activeCompany() || this.profileMissing(),
  );

  protected readonly profileParams = computed(() => ({
    rc: this.identity.activeCompany()?.registryCode ?? '',
    person: this.identity.personCode(),
  }));

  /** "Koosta profiil" → profile page, opening the create form directly (?create=1). */
  protected readonly createParams = computed(() => ({ ...this.profileParams(), create: '1' }));

  protected readonly companyName = computed(
    () => this.profile()?.businessName.value ?? this.identity.activeCompany()?.name ?? '',
  );

  protected readonly asOf = computed(() => {
    const iso = this.profile()?.dataAsOfDate;
    if (!iso) {
      return '—';
    }
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}.${m}.${y}`;
  });

  constructor() {
    const company = this.identity.activeCompany();
    if (!company) {
      this.loading.set(false);
      return;
    }
    this.api.getProfile(company.registryCode).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.profileMissing.set(err.status === 404);
        this.loading.set(false);
      },
    });
  }

  protected toRoles(): void {
    this.router.navigate(['/select-role']);
  }
}
