import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'dds-completeness',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dds-cmp__head">
      <span class="dds-cmp__label">Profiili täituvus</span>
      <span class="dds-cmp__pct">{{ percent() }}%</span>
    </div>
    <div
      class="dds-cmp__track"
      role="progressbar"
      [attr.aria-valuenow]="percent()"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="dds-cmp__fill" [style.width.%]="clamped()"></div>
    </div>
    @if (!complete()) {
      <button type="button" class="dds-cmp__cta" (click)="continue.emit()">
        Jätka täitmisega
      </button>
    }
  `,
  host: { class: 'dds-cmp' },
  styles: [
    `
      :host {
        display: block;
        background: var(--dds-color-surface);
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-card);
        padding: var(--dds-space-5);
        font-family: var(--dds-font-family);
      }
      .dds-cmp__head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: var(--dds-space-3);
      }
      .dds-cmp__label {
        font-size: var(--dds-font-size-md);
        font-weight: var(--dds-font-weight-medium);
        color: var(--dds-color-ink-strong);
      }
      .dds-cmp__pct {
        font-size: var(--dds-font-size-lg);
        font-weight: var(--dds-font-weight-bold);
        color: var(--dds-color-primary);
      }
      .dds-cmp__track {
        height: 8px;
        background: var(--dds-color-surface-alt);
        border-radius: var(--dds-radius-pill);
        overflow: hidden;
      }
      .dds-cmp__fill {
        height: 100%;
        background: var(--dds-color-primary);
        border-radius: var(--dds-radius-pill);
        transition: width 0.3s ease;
      }
      .dds-cmp__cta {
        margin-top: var(--dds-space-4);
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        font-weight: var(--dds-font-weight-medium);
        color: var(--dds-color-primary);
        text-decoration: underline;
        cursor: pointer;
      }
      .dds-cmp__cta:hover {
        color: var(--dds-color-primary-strong);
      }
      .dds-cmp__cta:focus-visible {
        outline: none;
        box-shadow: var(--dds-focus-ring);
        border-radius: var(--dds-radius-control);
      }
    `,
  ],
})
export class DdsCompleteness {
  readonly percent = input.required<number>();
  readonly continue = output<void>();

  protected readonly clamped = computed(() => Math.max(0, Math.min(100, this.percent())));
  protected readonly complete = computed(() => this.clamped() >= 100);
}
