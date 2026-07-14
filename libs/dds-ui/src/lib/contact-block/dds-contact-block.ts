import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'dds-contact-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (heading()) {
      <h3 class="dds-cb__title">{{ heading() }}</h3>
    }
    <div class="dds-cb__body">
      <ng-content></ng-content>
    </div>
  `,
  host: { class: 'dds-cb' },
  styles: [
    `
      :host {
        display: block;
        background: var(--dds-color-registry-highlight);
        border-radius: var(--dds-radius-card);
        padding: var(--dds-space-5);
        font-family: var(--dds-font-family);
      }
      .dds-cb__title {
        margin: 0 0 var(--dds-space-4);
        font-size: var(--dds-font-size-lg);
        font-weight: var(--dds-font-weight-bold);
        color: var(--dds-color-registry-accent);
      }
    `,
  ],
})
export class DdsContactBlock {
  readonly heading = input<string>('');
}
