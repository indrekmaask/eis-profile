import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DdsOption {
  value: string;
  label: string;
}

@Component({
  selector: 'dds-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DdsDropdown), multi: true },
  ],
  template: `
    <label class="dds-field">
      @if (label()) {
        <span class="dds-field__label">
          {{ label() }}@if (required()) {<span class="dds-field__req" aria-hidden="true">*</span>}
        </span>
      }
      <div class="dds-field__wrap">
        <select
          class="dds-field__control"
          [value]="value()"
          [disabled]="disabled()"
          (change)="onSelect($event)"
          (blur)="onTouched()"
        >
          @if (placeholder()) {
            <option value="" disabled hidden>{{ placeholder() }}</option>
          }
          @for (opt of options(); track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
        <span class="dds-field__chevron" aria-hidden="true">▾</span>
      </div>
    </label>
  `,
  styles: [
    `
      .dds-field {
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-1);
        font-family: var(--dds-font-family);
      }
      .dds-field__label {
        font-size: var(--dds-font-size-sm);
        font-weight: var(--dds-font-weight-medium);
      }
      .dds-field__req {
        color: var(--dds-color-error);
        margin-left: 2px;
      }
      .dds-field__wrap {
        position: relative;
      }
      .dds-field__control {
        appearance: none;
        width: 100%;
        font-family: inherit;
        font-size: var(--dds-font-size-md);
        color: var(--dds-color-ink-strong);
        background: var(--dds-color-surface);
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-control);
        padding: var(--dds-space-3) var(--dds-space-6) var(--dds-space-3) var(--dds-space-4);
        min-height: 48px;
      }
      .dds-field__control:focus {
        outline: none;
        border-color: var(--dds-color-primary-strong);
        box-shadow: var(--dds-focus-ring);
      }
      .dds-field__chevron {
        position: absolute;
        right: var(--dds-space-4);
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--dds-color-ink-subtle);
      }
    `,
  ],
})
export class DdsDropdown implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly options = input<DdsOption[]>([]);
  readonly required = input(false);

  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onSelect(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  writeValue(v: string): void {
    this.value.set(v ?? '');
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
