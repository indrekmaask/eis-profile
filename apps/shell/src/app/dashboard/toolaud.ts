import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DdsButton, DdsIcon, DdsIconName } from '@dds/ui';
import { IdentityService } from '../identity/identity.service';
import { RadarChart } from '../shared/radar-chart';

/**
 * Prototype-only dashboard (Figma "Töölaud"). Static demo content — stat tiles,
 * maturity radar, account manager, recommendations and empty-state lists.
 */
@Component({
  selector: 'app-toolaud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DdsButton, DdsIcon, RadarChart],
  template: `
    <div class="dash">
      <header class="dash__head">
        <div>
          <h1>{{ company()?.name ?? 'Ettevõte' }}</h1>
          <p class="dash__code">Registreerimise nr. {{ company()?.registryCode ?? '—' }}</p>
        </div>
        <a dds-button variant="secondary" size="sm" routerLink="/profile" [queryParams]="profileParams()">
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
            <a dds-button variant="secondary" size="sm" routerLink="/maturity/result">
              Vaata rohkem →
            </a>
          </div>
          <app-radar-chart [axes]="radarAxes" [values]="radarValues" [size]="300" />
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
            <div class="reco__icon"><dds-icon [name]="r.icon" /></div>
            <h3>{{ r.title }}</h3>
            <p>{{ r.body }}</p>
            <span class="reco__arrow">→</span>
          </div>
        }
      </div>

      <h2 class="dash__section">Aktiivsed taotlused</h2>
      <div class="card empty">
        <span class="empty__icon">☕</span>
        <div class="empty__text">
          <strong>Aktiivseid teenuseid veel pole</strong>
          <p>Kui alustad teenuse kasutamist või esitad taotluse, ilmuvad need siia.</p>
        </div>
        <button dds-button variant="secondary" size="sm">Tutvu teenuste kataloogiga →</button>
      </div>

      <h2 class="dash__section">Ettevõtte arenguplaan</h2>
      <div class="card empty">
        <span class="empty__icon">☕</span>
        <div class="empty__text">
          <strong>Arenguplaan pole veel loodud</strong>
          <p>Arenguplaan seob sinu eesmärgid ja EIS teenused üheks teekonnaks.</p>
        </div>
        <button dds-button variant="secondary" size="sm">Loo arenguplaan →</button>
      </div>
    </div>
  `,
  styles: [
    `
      .dash {
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-5);
        max-width: var(--dds-width-block);
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
        width: 64px;
        height: 64px;
        border-radius: 50%;
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
        color: var(--dds-color-registry-accent);
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
      }
      .reco__icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: 1px solid var(--dds-color-ink-strong);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--dds-space-3);
        color: var(--dds-color-ink-strong);
      }
      .reco__icon dds-icon {
        width: 24px;
        height: 24px;
      }
      .reco h3 {
        margin: 0 0 var(--dds-space-2);
        font-size: var(--dds-font-size-md);
        font-weight: var(--dds-font-weight-bold);
      }
      .reco p {
        margin: 0;
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      .reco__arrow {
        position: absolute;
        right: var(--dds-space-5);
        bottom: var(--dds-space-5);
        color: var(--dds-color-ink-muted);
      }
      .empty {
        display: flex;
        align-items: center;
        gap: var(--dds-space-4);
      }
      .empty__icon {
        font-size: 28px;
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

  protected readonly recommendations: { title: string; body: string; icon: DdsIconName }[] = [
    {
      title: 'Täienda ettevõtte profiili',
      body: 'Põhiandmed on Äriregistrist võetud, kuid puuduvad tooted, sihtturu huvi ja kontaktid.',
      icon: 'file-text',
    },
    {
      title: 'Loo arenguplaan',
      body: 'Seob sinu eesmärgid EIS-i teenustega ja näitab järgmise sammu teekonnal.',
      icon: 'trending-up',
    },
    {
      title: 'Tutvu teenustega',
      body: 'Vaata, milliseid toetusi, koolitusi ja nõustamisteenuseid EIS pakub sinu valdkonnas.',
      icon: 'compass',
    },
  ];
}
