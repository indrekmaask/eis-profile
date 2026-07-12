import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Read-only register-owned field: blue left border marks provenance.
 * Renders label + effective value; never editable (once-only principle).
 */
@Component({
  selector: 'dds-registry-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="dds-rf__label">{{ label() }}</span>
    @if (value()) {
      <span class="dds-rf__value">{{ value() }}</span>
    } @else {
      <span class="dds-rf__empty">—</span>
    }
  `,
  host: { class: 'dds-rf' },
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-1);
        padding: var(--dds-space-1) 0 var(--dds-space-1) var(--dds-space-4);
        border-left: 3px solid var(--dds-color-registry-accent);
        font-family: var(--dds-font-family);
      }
      .dds-rf__label {
        font-size: var(--dds-font-size-xs);
        font-weight: var(--dds-font-weight-medium);
        color: var(--dds-color-registry-accent);
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
      .dds-rf__value {
        font-size: var(--dds-font-size-md);
        color: var(--dds-color-ink-strong);
      }
      .dds-rf__empty {
        font-size: var(--dds-font-size-md);
        color: var(--dds-color-ink-subtle);
      }
    `,
  ],
})
export class DdsRegistryField {
  readonly label = input.required<string>();
  readonly value = input<string | null | undefined>('');
}
