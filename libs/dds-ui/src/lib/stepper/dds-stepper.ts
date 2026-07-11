import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface DdsStep {
  label: string;
}

/** Horizontal numbered stepper for the 4-step profile edit flow. */
@Component({
  selector: 'dds-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="dds-stepper__list">
      @for (step of steps(); track $index; let i = $index) {
        <li
          class="dds-stepper__item"
          [class.is-active]="i === active()"
          [class.is-done]="i < active()"
        >
          <button
            type="button"
            class="dds-stepper__btn"
            [attr.aria-current]="i === active() ? 'step' : null"
            (click)="select.emit(i)"
          >
            <span class="dds-stepper__marker">
              @if (i < active()) { ✓ } @else { {{ i + 1 }} }
            </span>
            <span class="dds-stepper__label">{{ step.label }}</span>
          </button>
        </li>
      }
    </ol>
  `,
  host: { class: 'dds-stepper' },
  styles: [
    `
      .dds-stepper__list {
        display: flex;
        gap: var(--dds-space-2);
        list-style: none;
        margin: 0;
        padding: 0;
        font-family: var(--dds-font-family);
      }
      .dds-stepper__item {
        flex: 1;
      }
      .dds-stepper__btn {
        display: flex;
        align-items: center;
        gap: var(--dds-space-2);
        width: 100%;
        background: none;
        border: none;
        border-top: 3px solid var(--dds-color-border);
        padding: var(--dds-space-3) 0 0;
        cursor: pointer;
        font: inherit;
        text-align: left;
        color: var(--dds-color-ink-subtle);
      }
      .is-active .dds-stepper__btn {
        border-top-color: var(--dds-color-primary);
        color: var(--dds-color-ink-strong);
      }
      .is-done .dds-stepper__btn {
        border-top-color: var(--dds-color-primary);
        color: var(--dds-color-ink-muted);
      }
      .dds-stepper__marker {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: var(--dds-radius-pill);
        background: var(--dds-color-surface-alt);
        font-size: var(--dds-font-size-sm);
        font-weight: var(--dds-font-weight-bold);
        flex: none;
      }
      .is-active .dds-stepper__marker,
      .is-done .dds-stepper__marker {
        background: var(--dds-color-primary);
        color: var(--dds-color-primary-contrast);
      }
      .dds-stepper__label {
        font-size: var(--dds-font-size-sm);
        font-weight: var(--dds-font-weight-medium);
      }
      .dds-stepper__btn:focus-visible {
        outline: none;
        box-shadow: var(--dds-focus-ring);
        border-radius: var(--dds-radius-control);
      }
    `,
  ],
})
export class DdsStepper {
  readonly steps = input.required<DdsStep[]>();
  readonly active = input(0);
  readonly select = output<number>();
}
