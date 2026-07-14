import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'dds-registry-provenance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="dds-prov__icon" aria-hidden="true">ⓘ</span>
    <span class="dds-prov__text">
      Andmed pärinevad registritest@if (asOf()) { (seisuga {{ asOf() }})}.
    </span>
    <button type="button" class="dds-prov__refresh" (click)="refresh.emit()">
      Värskenda andmeid
    </button>
  `,
  host: { class: 'dds-prov' },
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--dds-space-2);
        background: var(--dds-color-surface-alt);
        border-radius: var(--dds-radius-control);
        padding: var(--dds-space-3) var(--dds-space-4);
        font-family: var(--dds-font-family);
        font-size: var(--dds-font-size-sm);
        color: var(--dds-color-ink-muted);
      }
      .dds-prov__text {
        margin-right: auto;
      }
      .dds-prov__icon {
        color: var(--dds-color-registry-accent);
      }
      .dds-prov__refresh {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        color: var(--dds-color-primary);
        font-weight: var(--dds-font-weight-medium);
        text-decoration: underline;
        cursor: pointer;
      }
      .dds-prov__refresh:hover {
        color: var(--dds-color-primary-strong);
      }
      .dds-prov__refresh:focus-visible {
        outline: none;
        box-shadow: var(--dds-focus-ring);
        border-radius: var(--dds-radius-control);
      }
    `,
  ],
})
export class DdsRegistryProvenance {
  /** Register data date (dataAsOfDate), already formatted for display. */
  readonly asOf = input<string | null | undefined>('');
  readonly refresh = output<void>();
}
