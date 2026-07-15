import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const DEFAULT_PREFIXES = ['+372', '+371', '+370', '+358', '+46', '+47', '+45', '+49'];

/** Phone field with a country-prefix selector. CVA value is the combined "+372 5551234" string. */
@Component({
  selector: 'dds-phone-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DdsPhoneInput), multi: true },
  ],
  template: `
    <label class="dds-field">
      @if (label()) {
        <span class="dds-field__label">
          {{ label() }}@if (required()) {<span class="dds-field__req" aria-hidden="true">*</span>}
        </span>
      }
      <div class="dds-phone" [class.dds-phone--error]="!!error()">
        <select
          class="dds-phone__prefix"
          [value]="prefix()"
          [disabled]="disabled()"
          (change)="onPrefix($event)"
          aria-label="Suunakood"
        >
          @for (p of prefixes(); track p) {
            <option [value]="p">{{ p }}</option>
          }
        </select>
        <input
          class="dds-phone__number"
          type="tel"
          inputmode="tel"
          [value]="number()"
          [disabled]="disabled()"
          [placeholder]="placeholder()"
          [attr.aria-label]="label() ? null : ariaLabel() || null"
          (input)="onNumber($event)"
          (blur)="onTouched()"
        />
      </div>
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
      }
      .dds-field__req {
        color: var(--dds-color-error);
        margin-left: 2px;
      }
      .dds-phone {
        display: flex;
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-control);
        overflow: hidden;
        background: var(--dds-color-surface);
      }
      .dds-phone:focus-within {
        border-color: var(--dds-color-primary-strong);
        box-shadow: var(--dds-focus-ring);
      }
      .dds-phone--error {
        border-color: var(--dds-color-error);
      }
      .dds-phone__prefix {
        appearance: none;
        border: none;
        border-right: 1px solid var(--dds-color-border);
        background: var(--dds-color-surface-alt);
        font-family: inherit;
        font-size: var(--dds-font-size-md);
        padding: 0 var(--dds-space-3);
        color: var(--dds-color-ink-strong);
      }
      .dds-phone__number {
        flex: 1;
        border: none;
        font-family: inherit;
        font-size: var(--dds-font-size-md);
        padding: var(--dds-space-3) var(--dds-space-4);
        min-height: 48px;
        color: var(--dds-color-ink-strong);
      }
      .dds-phone__prefix:focus,
      .dds-phone__number:focus {
        outline: none;
      }
      .dds-field__error {
        font-size: var(--dds-font-size-xs);
        color: var(--dds-color-error);
      }
    `,
  ],
})
export class DdsPhoneInput implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly placeholder = input<string>('');
  readonly required = input(false);
  readonly error = input<string>('');
  readonly prefixes = input<string[]>(DEFAULT_PREFIXES);

  protected readonly prefix = signal(DEFAULT_PREFIXES[0]);
  protected readonly number = signal('');
  protected readonly disabled = signal(false);

  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onPrefix(event: Event): void {
    this.prefix.set((event.target as HTMLSelectElement).value);
    this.emit();
  }
  protected onNumber(event: Event): void {
    this.number.set((event.target as HTMLInputElement).value);
    this.emit();
  }
  private emit(): void {
    const num = this.number().trim();
    // A number already carrying a country code (e.g. an unrecognized prefix that
    // writeValue left in the number part) must not get the prefix re-applied.
    this.onChange(!num ? '' : num.startsWith('+') ? num : `${this.prefix()} ${num}`);
  }

  writeValue(v: string): void {
    const raw = (v ?? '').trim();
    const match = this.prefixes().find((p) => raw.startsWith(p));
    if (match) {
      this.prefix.set(match);
      this.number.set(raw.slice(match.length).trim());
    } else {
      this.number.set(raw);
    }
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
