import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DdsButton } from '@dds/ui';
import { IdentityService } from '../identity/identity.service';
import { RadarChart } from '../shared/radar-chart';

/**
 * Prototype-only dashboard (Figma "Töölaud"). Static demo content — stat tiles,
 * maturity radar, account manager, recommendations and empty-state lists.
 */
@Component({
  selector: 'app-toolaud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DdsButton, RadarChart],
  template: `
    <div class="dash">
      <header class="dash__head">
        <div>
          <h1>{{ company()?.name ?? 'Ettevõte' }}</h1>
          <p class="dash__code">Registreerimise nr. {{ company()?.registryCode ?? '—' }}</p>
        </div>
        <a dds-button variant="pill" size="sm" routerLink="/profile" [queryParams]="profileParams()">
          Ettevõtte profiil →
        </a>
      </header>

      <div class="dash__stats">
        @for (s of stats; track s.label) {
          <div class="stat">
            <div class="stat__value">{{ s.value }}</div>
            <div class="stat__label">{{ s.label }}</div>
          </div>
        }
      </div>

      <div class="dash__row">
        <section class="card diag">
          <div class="diag__text">
            <h2>Küpsusdiagnostika</h2>
            <p>Hinda ettevõtte küpsust seitsmes valdkonnas ja saa suunatud soovitused.</p>
            <a dds-button variant="pill" size="sm" routerLink="/maturity/result">
              Vaata rohkem →
            </a>
          </div>
          <app-radar-chart [axes]="radarAxes" [values]="radarValues" [size]="260" />
        </section>

        <section class="card manager">
          <h2>Kliendihaldur</h2>
          <div class="manager__body">
            <div class="manager__avatar" aria-hidden="true">MA</div>
            <div>
              <strong>Maarja Arumets</strong>
              <p>maarja.arumets&#64;eis.ee</p>
              <p>+372 5896 5715</p>
            </div>
          </div>
        </section>
      </div>

      <h2 class="dash__section">Soovitused sinu ettevõttele</h2>
      <div class="dash__cards3">
        @for (r of recommendations; track r.title) {
          <div class="card reco">
            <span class="reco__badge">{{ r.badge }}</span>
            <h3>{{ r.title }}</h3>
            <p>{{ r.body }}</p>
            <span class="reco__arrowbtn" aria-hidden="true">→</span>
          </div>
        }
      </div>

      <h2 class="dash__section">Aktiivsed taotlused</h2>
      <div class="card empty">
        <span class="empty__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2v2" /><path d="M14 2v2" />
            <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
            <path d="M6 2v2" />
          </svg>
        </span>
        <div class="empty__text">
          <strong>Aktiivseid teenuseid veel pole</strong>
          <p>Kui alustad teenuse kasutamist või esitad taotluse, ilmuvad need siia.</p>
        </div>
        <button dds-button variant="pill">Tutvu teenuste kataloogiga →</button>
      </div>

      <h2 class="dash__section">Ettevõtte arenguplaan</h2>
      <div class="card empty">
        <span class="empty__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2v2" /><path d="M14 2v2" />
            <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
            <path d="M6 2v2" />
          </svg>
        </span>
        <div class="empty__text">
          <strong>Arenguplaan pole veel loodud</strong>
          <p>Arenguplaan seob sinu eesmärgid ja EIS teenused üheks teekonnaks.</p>
        </div>
        <button dds-button variant="pill">Loo arenguplaan →</button>
      </div>
    </div>
  `,
  styles: [
    `
      .dash {
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-5);
      }
      .dash__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--dds-space-4);
      }
      h1 {
        margin: 0;
        font-size: var(--dds-font-size-2xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .dash__code {
        margin: var(--dds-space-1) 0 0;
        color: var(--dds-color-ink-muted);
      }
      .dash__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--dds-space-4);
      }
      .stat {
        border-left: 1px solid var(--dds-color-border);
        padding-left: var(--dds-space-4);
      }
      .stat:first-child {
        border-left: none;
        padding-left: 0;
      }
      .stat__value {
        font-size: var(--dds-font-size-2xl);
        font-weight: var(--dds-font-weight-regular);
        white-space: nowrap;
      }
      .stat__label {
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      .card {
        background: var(--dds-color-surface);
        border-radius: var(--dds-radius-card);
        box-shadow: var(--dds-shadow-card);
        padding: var(--dds-space-5);
      }
      .dash__row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--dds-space-4);
      }
      .diag {
        display: flex;
        align-items: center;
        gap: var(--dds-space-4);
      }
      .diag__text {
        flex: 1;
        max-width: 55%;
      }
      .diag app-radar-chart {
        flex: none;
        margin: 0 var(--dds-space-6) 0 var(--dds-space-4);
      }
      .diag h2,
      .manager h2 {
        margin: 0 0 var(--dds-space-2);
        font-size: var(--dds-font-size-xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .diag p {
        margin: 0 0 var(--dds-space-4);
        color: var(--dds-color-ink-muted);
      }
      .manager {
        background: var(--dds-color-registry-highlight);
        box-shadow: none;
      }
      .manager__body {
        display: flex;
        gap: var(--dds-space-3);
        align-items: center;
      }
      .manager__avatar {
        width: 96px;
        height: 96px;
        border-radius: var(--dds-radius-control);
        background: var(--dds-color-registry-accent);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: var(--dds-font-weight-bold);
        flex: none;
      }
      .manager__body strong {
        display: block;
        color: var(--dds-color-ink-strong);
      }
      .manager__body p {
        margin: 2px 0 0;
        font-size: var(--dds-font-size-sm);
        color: var(--dds-color-ink-muted);
      }
      .dash__section {
        margin: var(--dds-space-3) 0 0;
        font-size: var(--dds-font-size-xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .dash__cards3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--dds-space-4);
      }
      .reco {
        position: relative;
        padding-right: 72px;
      }
      .reco__badge {
        display: inline-block;
        background: #d8e4fb;
        color: var(--dds-color-primary);
        font-size: var(--dds-font-size-sm);
        font-weight: var(--dds-font-weight-medium);
        border-radius: var(--dds-radius-pill);
        padding: 2px var(--dds-space-3);
        margin-bottom: var(--dds-space-3);
      }
      .reco h3 {
        margin: 0 0 var(--dds-space-2);
        font-size: var(--dds-font-size-lg);
        font-weight: var(--dds-font-weight-regular);
      }
      .reco p {
        margin: 0;
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      .reco__arrowbtn {
        position: absolute;
        right: var(--dds-space-4);
        bottom: var(--dds-space-4);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e2e8f0;
        color: var(--dds-color-ink-strong);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .empty {
        display: flex;
        align-items: center;
        gap: var(--dds-space-4);
      }
      .empty__icon {
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
      .empty__icon svg {
        width: 26px;
        height: 26px;
      }
      .empty__text {
        flex: 1;
      }
      .empty__text strong {
        display: block;
      }
      .empty__text p {
        margin: 2px 0 0;
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      @media (max-width: 900px) {
        .dash__stats,
        .dash__cards3 {
          grid-template-columns: 1fr 1fr;
        }
        .dash__row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class Toolaud {
  private readonly identity = inject(IdentityService);
  protected readonly company = this.identity.activeCompany;

  protected readonly profileParams = computed(() => ({
    rc: this.company()?.registryCode ?? '',
    person: this.identity.personCode(),
  }));

  protected readonly stats = [
    { value: '0', label: 'Aktiivsed teenused' },
    { value: '0', label: 'Avatud taotlused' },
    { value: '0€', label: 'Kasutatud toetused' },
    { value: '120 456 €', label: 'VTA jääk' },
  ];

  protected readonly radarAxes = [
    'Juhtimine',
    'Digi',
    'Finants',
    'Kestlikkus',
    'Innovatsioon',
    'Andmed & AI',
    'Eksport',
  ];
  protected readonly radarValues = [0.75, 0.6, 0.65, 0.45, 0.4, 0.5, 0.7];

  protected readonly recommendations = [
    {
      badge: 'Toetus',
      title: 'Ekspordi stardiabi — 20 000 €',
      body: 'Taotlusperiood avatud kuni 30.06.',
    },
    {
      badge: 'Nõustamine',
      title: 'Arenguprogrammi eelnõustamine',
      body: 'Läti turu ekspert. Kestab 45 min, tasuta diagnostika läbinutele.',
    },
    {
      badge: 'Analüüs',
      title: 'Sihtturu uuring: Läti',
      body: 'EIS koostab sinu toodetele põhjaliku turuanalüüsi.',
    },
  ];
}
