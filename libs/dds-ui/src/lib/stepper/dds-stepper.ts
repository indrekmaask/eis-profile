import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface DdsStep {
  label: string;
}

/** Horizontal numbered stepper for the 4-step profile edit flow. */
/** Horizontal numbered stepper — Figma pattern: label above a numbered circle, thin connector line through the circles. */
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
          [class.is-first]="i === 0"
          [class.is-last]="i === steps().length - 1"
        >
          <button
            type="button"
            class="dds-stepper__btn"
            [attr.aria-current]="i === active() ? 'step' : null"
            (click)="select.emit(i)"
          >
            <span class="dds-stepper__label">{{ step.label }}</span>
            <span class="dds-stepper__marker">{{ i + 1 }}</span>
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
        list-style: none;
        margin: 0;
        padding: 0;
        font-family: var(--dds-font-family);
      }
      .dds-stepper__item {
        flex: 1;
        position: relative;
      }
      /* connector line at circle mid-height */
      .dds-stepper__item::before,
      .dds-stepper__item::after {
        content: '';
        position: absolute;
        bottom: 16px;
        height: 1px;
        background: var(--dds-color-border);
      }
      .dds-stepper__item::before { left: 0; right: calc(50% + 24px); }
      .dds-stepper__item::after { left: calc(50% + 24px); right: 0; }
      .is-first::before, .is-last::after { display: none; }
      .dds-stepper__btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--dds-space-3);
        width: 100%;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        font: inherit;
        color: var(--dds-color-ink-strong);
      }
      .dds-stepper__label {
        font-size: var(--dds-font-size-md);
        font-weight: var(--dds-font-weight-regular);
      }
      .is-active .dds-stepper__label {
        font-weight: var(--dds-font-weight-bold);
      }
      .dds-stepper__marker {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: var(--dds-radius-pill);
        background: var(--dds-color-surface-alt);
        border: 1px solid var(--dds-color-border);
        font-size: var(--dds-font-size-sm);
        font-weight: var(--dds-font-weight-bold);
        flex: none;
      }
      .is-active .dds-stepper__marker {
        background: var(--dds-color-primary);
        border-color: var(--dds-color-primary);
        color: var(--dds-color-primary-contrast);
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
