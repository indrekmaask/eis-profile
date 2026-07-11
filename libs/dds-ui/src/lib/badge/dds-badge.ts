import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DdsBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'dds-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  host: { '[class]': '"dds-badge dds-badge--" + tone()' },
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--dds-space-1);
        font-family: var(--dds-font-family);
        font-size: var(--dds-font-size-xs);
        font-weight: var(--dds-font-weight-medium);
        line-height: var(--dds-line-height-tight);
        padding: var(--dds-space-1) var(--dds-space-3);
        border-radius: var(--dds-radius-pill);
      }
      :host(.dds-badge--neutral) {
        background: var(--dds-color-surface-alt);
        color: var(--dds-color-ink-muted);
      }
      :host(.dds-badge--info) {
        background: var(--dds-color-registry-highlight);
        color: var(--dds-color-registry-accent);
      }
      :host(.dds-badge--success) {
        background: var(--dds-color-success-bg);
        color: var(--dds-color-success);
      }
      :host(.dds-badge--warning) {
        background: var(--dds-color-warning-bg);
        color: var(--dds-color-warning);
      }
      :host(.dds-badge--error) {
        background: var(--dds-color-error-bg);
        color: var(--dds-color-error);
      }
    `,
  ],
})
export class DdsBadge {
  readonly tone = input<DdsBadgeTone>('neutral');
}
