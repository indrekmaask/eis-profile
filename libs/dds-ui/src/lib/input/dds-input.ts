import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let uid = 0;

@Component({
  selector: 'dds-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DdsInput), multi: true },
  ],
  template: `
    <label class="dds-field">
      @if (label()) {
        <span class="dds-field__label">
          {{ label() }}@if (required()) {<span class="dds-field__req" aria-hidden="true">*</span>}
        </span>
      }
      @if (description()) {
        <span class="dds-field__desc">{{ description() }}</span>
      }
      <input
        class="dds-field__control"
        [class.dds-field__control--error]="!!error()"
        [type]="type()"
        [value]="value()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [attr.inputmode]="inputmode()"
        [attr.aria-invalid]="!!error()"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      @if (error()) {
        <span class="dds-field__error" role="alert">{{ error() }}</span>
      }
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
        color: var(--dds-color-ink-strong);
      }
      .dds-field__req {
        color: var(--dds-color-error);
        margin-left: 2px;
      }
      .dds-field__desc {
        font-size: var(--dds-font-size-xs);
        color: var(--dds-color-ink-subtle);
      }
      .dds-field__control {
        font-family: inherit;
        font-size: var(--dds-font-size-md);
        color: var(--dds-color-ink-strong);
        background: var(--dds-color-surface);
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-control);
        padding: var(--dds-space-3) var(--dds-space-4);
        min-height: 48px;
      }
      .dds-field__control:focus {
        outline: none;
        border-color: var(--dds-color-primary-strong);
        box-shadow: var(--dds-focus-ring);
      }
      .dds-field__control--error {
        border-color: var(--dds-color-error);
      }
      .dds-field__control:disabled {
        background: var(--dds-color-surface-alt);
        color: var(--dds-color-ink-subtle);
      }
      .dds-field__error {
        font-size: var(--dds-font-size-xs);
        color: var(--dds-color-error);
      }
    `,
  ],
})
export class DdsInput implements ControlValueAccessor {
  readonly id = `dds-input-${uid++}`;
  readonly label = input<string>('');
  readonly description = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly inputmode = input<string | null>(null);
  readonly required = input(false);
  readonly error = input<string>('');

  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
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
