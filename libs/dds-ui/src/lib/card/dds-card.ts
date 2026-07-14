import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'dds-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (heading()) {
      <header class="dds-card__head">
        <h3 class="dds-card__title">{{ heading() }}</h3>
        <span class="dds-card__actions"><ng-content select="[card-actions]"></ng-content></span>
      </header>
    }
    <div class="dds-card__body">
      <ng-content></ng-content>
    </div>
  `,
  host: { class: 'dds-card' },
  styles: [
    `
      :host {
        display: block;
        background: var(--dds-color-surface);
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-card);
        box-shadow: var(--dds-shadow-card);
        padding: var(--dds-space-5);
        font-family: var(--dds-font-family);
      }
      .dds-card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--dds-space-3);
        margin-bottom: var(--dds-space-4);
      }
      .dds-card__title {
        margin: 0;
        font-size: var(--dds-font-size-lg);
        font-weight: var(--dds-font-weight-bold);
        color: var(--dds-color-ink-strong);
      }
      .dds-card__body {
        color: var(--dds-color-ink-muted);
      }
    `,
  ],
})
export class DdsCard {
  readonly heading = input<string>('');
}
