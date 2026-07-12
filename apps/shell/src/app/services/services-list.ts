import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DdsButton } from '@dds/ui';
import { ProfileApiService, ProfileView } from '@eis/profile-api';
import { IdentityService } from '../identity/identity.service';
import { SERVICES, ServiceDef, Verdict, evaluate, verdictIcon, verdictRank } from './services.data';

interface EvaluatedService {
  s: ServiceDef;
  v: Verdict;
}

/**
 * "Minu teenused" — services list with a per-service eligibility pre-assessment
 * computed from the company's profile + register data. Best-fit services first.
 */
@Component({
  selector: 'app-services-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DdsButton],
  template: `
    <div class="svc">
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
          <div class="svc__empty-ico">▤</div>
          <h2>Koosta esmalt profiil</h2>
          <p>Kui profiil on olemas, saame arvutada, milliste teenuste jaoks kvalifitseerud.</p>
          <a dds-button variant="primary" size="sm" routerLink="/profile" [queryParams]="profileParams()">
            Koosta profiil →
          </a>
        </div>
      } @else {
        <p class="svc__lead">
          See on <b>eelhinnang</b> sinu profiili ja registriandmete põhjal — see aitab leida sobivaid
          teenuseid, aga <b>ei ole lõplik otsus</b>. Iga taotluse vaatab üle menetleja. Sobivad
          teenused on eespool.
        </p>
        <div class="svc__list">
          @for (e of evaluated(); track e.s.id) {
            <a class="svc__row" [routerLink]="['/services', e.s.id]">
              <span class="svc__ico" [class]="'is-' + e.v.kind">{{ icon(e.v.kind) }}</span>
              <span class="svc__body">
                <span class="svc__name">{{ e.s.name }}</span>
                <span class="svc__meta">{{ e.v.txt }} · {{ e.s.sum }}</span>
              </span>
              <span class="svc__arrow">→</span>
            </a>
          }
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
      .svc__crumb {
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      h1 {
        margin: 0;
        font-size: var(--dds-font-size-2xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .svc__lead {
        margin: 0 0 var(--dds-space-2);
        max-width: 760px;
        color: var(--dds-color-ink-muted);
      }
      .svc__muted {
        color: var(--dds-color-ink-muted);
      }
      .svc__list {
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-3);
      }
      .svc__row {
        display: flex;
        align-items: center;
        gap: var(--dds-space-4);
        background: var(--dds-color-surface);
        border-radius: var(--dds-radius-card);
        box-shadow: var(--dds-shadow-card);
        padding: var(--dds-space-4) var(--dds-space-5);
        text-decoration: none;
        color: var(--dds-color-ink-strong);
      }
      .svc__row:hover {
        outline: 2px solid var(--dds-color-primary);
      }
      .svc__ico {
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: var(--dds-font-weight-bold);
      }
      .svc__ico.is-ok {
        background: var(--dds-color-success-bg);
        color: var(--dds-color-success);
      }
      .svc__ico.is-no {
        background: var(--dds-color-error-bg);
        color: var(--dds-color-error);
      }
      .svc__ico.is-warn {
        background: var(--dds-color-warning-bg);
        color: var(--dds-color-warning);
      }
      .svc__ico.is-maybe,
      .svc__ico.is-open {
        background: var(--dds-color-registry-highlight);
        color: var(--dds-color-registry-accent);
      }
      .svc__body {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
      }
      .svc__name {
        font-weight: var(--dds-font-weight-bold);
      }
      .svc__meta {
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      .svc__arrow {
        color: var(--dds-color-ink-muted);
      }
      .svc__empty {
        background: var(--dds-color-surface);
        border-radius: var(--dds-radius-card);
        box-shadow: var(--dds-shadow-card);
        padding: var(--dds-space-6);
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-3);
        align-items: flex-start;
      }
      .svc__empty-ico {
        font-size: 28px;
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

  protected readonly loading = signal(true);
  protected readonly profileMissing = signal(false);
  private readonly profile = signal<ProfileView | null>(null);

  protected readonly profileParams = computed(() => ({
    rc: this.identity.activeCompany()?.registryCode ?? '',
    person: this.identity.personCode(),
  }));

  protected readonly evaluated = computed<EvaluatedService[]>(() => {
    const p = this.profile();
    if (!p) {
      return [];
    }
    return SERVICES.map((s) => ({ s, v: evaluate(p, s) }))
      .sort((a, b) => verdictRank(a.v.kind) - verdictRank(b.v.kind));
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

  protected icon(kind: Verdict['kind']): string {
    return verdictIcon(kind);
  }
  protected toRoles(): void {
    this.router.navigate(['/select-role']);
  }
}
