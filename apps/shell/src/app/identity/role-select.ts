import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { DdsButton, DdsIcon } from '@dds/ui';
import { AccessEntry, ProfileApiService } from '@eis/profile-api';
import { IdentityService } from './identity.service';

/**
 * Demo access for companies with NO backend profile (Scenario 2): profile_access
 * rows require an existing profile, so registry-only companies are listed here by
 * registry code only — the company data itself is fetched from the register (mock API).
 */
const DEMO_REGISTRY_CODES: Record<string, string[]> = {
  '48505150220': ['16789012', '16890123'],
};

/** "Vali roll": lists companies the logged-in person may act for (via profile_access). */
@Component({
  selector: 'app-role-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DdsButton, DdsIcon],
  template: `
    <div class="roles">
      <div class="roles__intro">
        <h1>Vali roll</h1>
        <p>
          Iseteenindusse sisse logimiseks peab sul olema Eestis registreeritud ettevõte ning pead
          olema selle ettevõtte juhatuse liige või ettevõtte volitatud esindaja.
        </p>
        <button dds-button variant="pill" (click)="back()">
          ‹ Katkesta ja tagasi avalehele
        </button>
      </div>

      <div class="roles__panel">
        @if (loading()) {
          <p class="roles__muted">Laen ettevõtteid…</p>
        } @else if (entries().length) {
          <span class="roles__panel-heading">Sinu isikukoodiga seotud ettevõtted</span>
          <ul class="roles__list">
            @for (e of entries(); track e.registryCode) {
              <li>
                <button type="button" class="roles__company" (click)="choose(e)">
                  <dds-icon name="briefcase" />
                  <span>{{ e.businessName }}</span>
                </button>
              </li>
            }
          </ul>
        } @else {
          <span class="roles__panel-heading">Sinu isikukoodiga seotud ettevõtted</span>
          <p class="roles__muted">
            Sellel isikul ei ole registris seotud ettevõtteid. Proovi mõnda näidiskasutajat.
          </p>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .roles {
        max-width: var(--dds-width-content, 1120px);
        margin: 0 auto;
        padding: var(--dds-space-7) var(--dds-space-6);
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: var(--dds-space-7);
        align-items: start;
      }
      @media (max-width: 800px) {
        .roles {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .roles__intro {
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-4);
        align-items: flex-start;
      }
      h1 {
        margin: 0;
        font-size: var(--dds-font-size-2xl, 44px);
        font-weight: var(--dds-font-weight-regular);
      }
      p {
        margin: 0;
        color: var(--dds-color-ink-muted);
      }
      .roles__panel {
        background: var(--dds-color-surface, #fff);
        border-radius: var(--dds-radius-lg, 12px);
        box-shadow: var(--dds-shadow-card, 0 1px 3px rgba(16, 24, 40, 0.08));
        padding: var(--dds-space-5) var(--dds-space-6);
      }
      .roles__panel-heading {
        display: block;
        color: var(--dds-color-ink-muted);
        padding-bottom: var(--dds-space-4);
        border-bottom: 1px solid var(--dds-color-border, #e4e7ec);
      }
      .roles__list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .roles__list li + li {
        border-top: 1px solid var(--dds-color-border, #e4e7ec);
      }
      .roles__company {
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--dds-space-3);
        padding: var(--dds-space-4) var(--dds-space-2);
        background: none;
        border: 0;
        font: inherit;
        font-weight: var(--dds-font-weight-bold);
        color: var(--dds-color-ink);
        cursor: pointer;
        text-align: left;
      }
      .roles__company:hover {
        color: var(--dds-color-primary);
      }
      .roles__company dds-icon {
        width: 20px;
        height: 20px;
        flex: none;
        color: var(--dds-color-ink-subtle);
      }
      .roles__muted {
        color: var(--dds-color-ink-subtle);
        font-size: var(--dds-font-size-sm);
        margin-top: var(--dds-space-3);
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
    this.api
      .listAccess(this.identity.personCode())
      .pipe(catchError(() => of([] as AccessEntry[])))
      .subscribe((list) => this.resolveDemoCompanies(list));
  }

  /** Registry-only demo companies: fetch their data from the register (mock API). */
  private resolveDemoCompanies(list: AccessEntry[]): void {
    const missing = (DEMO_REGISTRY_CODES[this.identity.personCode()] ?? []).filter(
      (code) => !list.some((e) => e.registryCode === code),
    );
    if (!missing.length) {
      this.entries.set(list);
      this.loading.set(false);
      return;
    }
    forkJoin(
      missing.map((code) =>
        this.api.prefill(code).pipe(
          map(
            (p): AccessEntry => ({
              registryCode: p.registryCode,
              businessName: p.businessName,
              accessRole: 'BOARD_MEMBER',
            }),
          ),
          catchError(() => of(null)),
        ),
      ),
    ).subscribe((extra) => {
      this.entries.set([...list, ...extra.filter((e): e is AccessEntry => e !== null)]);
      this.loading.set(false);
    });
  }

  protected choose(e: AccessEntry): void {
    this.identity.selectCompany(e.registryCode, e.businessName);
    // No profile yet (register-only company) → land on the profile page, not the dashboard.
    this.api
      .getProfile(e.registryCode)
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      )
      .subscribe((hasProfile) => {
        if (hasProfile) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/profile'], {
            queryParams: { rc: e.registryCode, person: this.identity.personCode() },
          });
        }
      });
  }

  protected back(): void {
    this.router.navigate(['/']);
  }
}
