import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DdsBadge, DdsButton, DdsIcon, DdsIconName } from '@dds/ui';
import { RadarChart } from '../shared/radar-chart';

/** Prototype-only maturity result (Figma "Digiküpsus" results). Static demo. */
@Component({
  selector: 'app-kupsus-tulemus',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DdsBadge, DdsButton, DdsIcon, RadarChart],
  template: `
    <div class="kt">
      <nav class="kt__crumb">Peamine / Küpsusdiagnostika / Digiküpsuse hindamine</nav>
      <header class="kt__head">
        <h1>Digiküpsus</h1>
        <a dds-button variant="primary" size="sm" routerLink="/maturity/assessment">
          Alusta uus →
        </a>
      </header>
      <p class="kt__lead">
        Tulemus annab ülevaate ettevõtte digiküpsusest ja järgmistest sammudest. Soovitused on
        seotud sinu vastustega ning EIS-i teenustega.
      </p>

      <section class="card result">
        <div class="result__text">
          <dds-badge tone="neutral">Läbitud 21.04.2026</dds-badge>
          <h2>Teie küpsustase: <span class="result__level">{{ level }}</span></h2>
          <p>
            Teie ettevõttes toimivad protsessid ja süsteemid korrapäraselt. Järgmine samm on andmete
            kasutamine otsuste toetamiseks ja skaleerimine.
          </p>
          <div class="scale">
            @for (l of levels; track l; let i = $index) {
              <div class="scale__col">
                <div class="scale__bar" [class.is-on]="i <= activeLevel" [class.is-active]="i === activeLevel"></div>
                <span class="scale__label" [class.is-active]="i === activeLevel">{{ l }}</span>
              </div>
            }
          </div>
        </div>
        <app-radar-chart [axes]="radarAxes" [values]="radarValues" [size]="340" />
      </section>

      <h2 class="kt__section">Soovitused sinu ettevõttele</h2>
      <div class="kt__cards3">
        @for (r of recommendations; track r.title) {
          <div class="card reco">
            <dds-badge tone="info">{{ r.tag }}</dds-badge>
            <h3>{{ r.title }}</h3>
            <p>{{ r.body }}</p>
            <span class="reco__arrow">→</span>
          </div>
        }
      </div>

      <h2 class="kt__section">Teiste valdkondade diagnostikad</h2>
      <div class="kt__grid">
        @for (d of otherDiagnostics; track d.label) {
          <a class="card diag" routerLink="/maturity/assessment">
            <span class="diag__icon"><dds-icon [name]="d.icon" /></span>
            <span class="diag__label">{{ d.label }}</span>
            <span class="diag__arrow">→</span>
          </a>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .kt {
        max-width: var(--dds-width-block);
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-3);
      }
      .kt__crumb {
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      .kt__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      h1 {
        margin: 0;
        font-size: var(--dds-font-size-2xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .kt__lead {
        margin: 0;
        max-width: 720px;
        color: var(--dds-color-ink-muted);
      }
      .card {
        background: var(--dds-color-surface);
        border-radius: var(--dds-radius-card);
        box-shadow: var(--dds-shadow-card);
        padding: var(--dds-space-5);
      }
      .result {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: var(--dds-space-5);
        align-items: center;
        margin-top: var(--dds-space-3);
      }
      .result__text h2 {
        margin: var(--dds-space-3) 0;
        font-size: var(--dds-font-size-xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .result__level {
        color: var(--dds-color-primary);
      }
      .result__text p {
        margin: 0 0 var(--dds-space-5);
        color: var(--dds-color-ink-muted);
      }
      .scale {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: var(--dds-space-2);
      }
      .scale__col {
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-2);
      }
      .scale__bar {
        height: 6px;
        border-radius: var(--dds-radius-pill);
        background: var(--dds-color-border);
      }
      .scale__bar.is-on {
        background: color-mix(in srgb, var(--dds-color-primary) 45%, transparent);
      }
      .scale__bar.is-active {
        background: var(--dds-color-primary);
      }
      .scale__label {
        font-size: var(--dds-font-size-xs);
        color: var(--dds-color-ink-muted);
      }
      .scale__label.is-active {
        color: var(--dds-color-ink-strong);
        font-weight: var(--dds-font-weight-bold);
      }
      .kt__section {
        margin: var(--dds-space-4) 0 0;
        font-size: var(--dds-font-size-xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .kt__cards3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--dds-space-4);
      }
      .reco {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-2);
        min-height: 130px;
      }
      .reco h3 {
        margin: var(--dds-space-1) 0 0;
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
      .kt__grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--dds-space-4);
      }
      .diag {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-3);
        min-height: 120px;
        text-decoration: none;
        color: var(--dds-color-ink-strong);
      }
      .diag:hover {
        outline: 2px solid var(--dds-color-primary);
      }
      .diag__icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 1px solid var(--dds-color-ink-strong);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--dds-color-ink-strong);
      }
      .diag__icon dds-icon {
        width: 22px;
        height: 22px;
      }
      .diag__label {
        font-weight: var(--dds-font-weight-medium);
      }
      .diag__arrow {
        position: absolute;
        right: var(--dds-space-4);
        bottom: var(--dds-space-4);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--dds-color-surface-alt);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--dds-color-ink-muted);
      }
      @media (max-width: 900px) {
        .result {
          grid-template-columns: 1fr;
        }
        .kt__cards3,
        .kt__grid {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
})
export class KupsusTulemus {
  protected readonly level = 'Rakendaja';
  protected readonly levels = ['Huviline', 'Katsetaja', 'Rakendaja', 'Strateegiline uuendaja', 'Lipulaev'];
  protected readonly activeLevel = 2;

  protected readonly radarAxes = [
    'Ärimudel ja juhtimine',
    'Protsessid',
    'Tehnoloogia ja andmed',
    'Klienditeekond ja müük',
    'Inimesed ja oskused',
  ];
  protected readonly radarValues = [0.72, 0.8, 0.55, 0.6, 0.5];

  protected readonly recommendations = [
    { tag: 'Toetus', title: 'Ekspordi stardiabi — 20 000 €', body: 'Taotlusperiood avatud kuni 30.06.' },
    { tag: 'Nõustamine', title: 'Broneeri eksperdi sessioon', body: 'Rootsi turu ekspert. Kestab 45 min, tasuta diagnostika läbinutele.' },
    { tag: 'Analüüs', title: 'Sihtturu uuring: Rootsi', body: 'EIS koostab sinu toodetele põhjaliku turuanalüüsi.' },
  ];

  protected readonly otherDiagnostics: { label: string; icon: DdsIconName }[] = [
    { label: 'Finants', icon: 'euro' },
    { label: 'Juhtimine', icon: 'users' },
    { label: 'Kestlikkus', icon: 'leaf' },
    { label: 'Eksport', icon: 'globe' },
    { label: 'Andmed & AI', icon: 'cpu' },
    { label: 'Innovatsioon', icon: 'lightbulb' },
  ];
}
