import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DdsButtonVariant = 'primary' | 'secondary' | 'ghost';
export type DdsButtonSize = 'md' | 'sm';

@Component({
  selector: 'dds-button, button[dds-button], a[dds-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': '"dds-btn dds-btn--" + variant() + " dds-btn--" + size()',
    '[attr.type]': 'type()',
    '[attr.disabled]': "disabled() ? '' : null",
    '[attr.aria-disabled]': 'disabled() || null',
  },
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--dds-space-2);
        font-family: var(--dds-font-family);
        font-weight: var(--dds-font-weight-medium);
        border-radius: var(--dds-radius-control);
        border: 1px solid transparent;
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        white-space: nowrap;
      }
      :host(.dds-btn--md) {
        font-size: var(--dds-font-size-md);
        padding: var(--dds-space-3) var(--dds-space-5);
        min-height: 48px;
      }
      :host(.dds-btn--sm) {
        font-size: var(--dds-font-size-sm);
        padding: var(--dds-space-2) var(--dds-space-4);
        min-height: 36px;
      }
      :host(.dds-btn--primary) {
        background: var(--dds-color-primary);
        color: var(--dds-color-primary-contrast);
      }
      :host(.dds-btn--primary:hover) {
        background: var(--dds-color-primary-strong);
      }
      :host(.dds-btn--secondary) {
        background: var(--dds-color-surface);
        color: var(--dds-color-primary);
        border-color: var(--dds-color-primary);
      }
      :host(.dds-btn--secondary:hover) {
        background: var(--dds-color-surface-alt);
      }
      :host(.dds-btn--ghost) {
        background: transparent;
        color: var(--dds-color-primary);
      }
      :host(.dds-btn--ghost:hover) {
        background: var(--dds-color-surface-alt);
      }
      :host(:focus-visible) {
        outline: none;
        box-shadow: var(--dds-focus-ring);
      }
      :host([disabled]) {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
    `,
  ],
})
export class DdsButton {
  readonly variant = input<DdsButtonVariant>('primary');
  readonly size = input<DdsButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
}
