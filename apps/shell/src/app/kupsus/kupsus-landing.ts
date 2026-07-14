import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DdsIcon, DdsIconName } from '@dds/ui';

/** Prototype-only maturity-diagnostics landing (Figma "Küpsusdiagnostika"). Static. */
@Component({
  selector: 'app-kupsus-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DdsIcon],
  template: `
    <div class="kd">
      <nav class="kd__crumb">Peamine / Küpsusdiagnostika</nav>
      <h1>Hinda oma ettevõtte küpsust</h1>
      <p class="kd__lead">
        See aitab sul mõista selgelt oma tänast taset ja tuvastada peamised arengukohad.
        Küpsusdiagnostika abil saad struktureeritult hinnata erinevaid valdkondi — alates
        finantsidest ja juhtimisest kuni digitaliseerimise ja innovatsioonini.
      </p>
      <p class="kd__lead">
        Tulemuseks tekib terviklik ülevaade, mis toetab teadlikke otsuseid, aitab seada
        prioriteete ning suunab ressursid sinna, kus mõju on suurim.
      </p>

      <h2>Vali diagnostika</h2>
      <div class="kd__grid">
        @for (d of diagnostics; track d.label) {
          <a class="kd__card" [routerLink]="d.link">
            <span class="kd__icon"><dds-icon [name]="d.icon" /></span>
            <span class="kd__title">{{ d.label }}</span>
            <span class="kd__arrow">→</span>
          </a>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .kd {
        max-width: var(--dds-width-block);
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-3);
      }
      .kd__crumb {
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      h1 {
        margin: 0;
        font-size: var(--dds-font-size-2xl);
        font-weight: var(--dds-font-weight-regular);
      }
      .kd__lead {
        margin: 0;
        max-width: 720px;
        color: var(--dds-color-ink-muted);
      }
      h2 {
        margin: var(--dds-space-4) 0 0;
        font-size: var(--dds-font-size-xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .kd__grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--dds-space-4);
      }
      .kd__card {
        position: relative;
        background: var(--dds-color-surface);
        border-radius: var(--dds-radius-card);
        box-shadow: var(--dds-shadow-card);
        padding: var(--dds-space-5);
        min-height: 150px;
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-4);
        text-decoration: none;
        color: var(--dds-color-ink-strong);
      }
      .kd__card:hover {
        outline: 2px solid var(--dds-color-primary);
      }
      .kd__icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: 1px solid var(--dds-color-ink-strong);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--dds-color-ink-strong);
      }
      .kd__icon dds-icon {
        width: 26px;
        height: 26px;
      }
      .kd__title {
        font-weight: var(--dds-font-weight-medium);
      }
      .kd__arrow {
        position: absolute;
        right: var(--dds-space-5);
        bottom: var(--dds-space-5);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--dds-color-surface-alt);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--dds-color-ink-muted);
      }
      @media (max-width: 900px) {
        .kd__grid {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
})
export class KupsusLanding {
  protected readonly diagnostics: { label: string; icon: DdsIconName; link: string }[] = [
    { label: 'Finants', icon: 'euro', link: '/maturity/assessment' },
    { label: 'Digi', icon: 'monitor', link: '/maturity/assessment' },
    { label: 'Juhtimine', icon: 'users', link: '/maturity/assessment' },
    { label: 'Kestlikkus', icon: 'leaf', link: '/maturity/assessment' },
    { label: 'Eksport', icon: 'globe', link: '/maturity/assessment' },
    { label: 'Andmed & AI', icon: 'cpu', link: '/maturity/assessment' },
    { label: 'Innovatsioon', icon: 'lightbulb', link: '/maturity/assessment' },
  ];
}
