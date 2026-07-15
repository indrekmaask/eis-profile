import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DdsOption {
  value: string;
  label: string;
  action?: boolean;
}

let uid = 0;

@Component({
  selector: 'dds-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'open.set(false)' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DdsDropdown), multi: true },
  ],
  template: `
    <div class="dds-dd">
      @if (label()) {
        <span class="dds-dd__label" [id]="labelId">
          {{ label() }}@if (required()) {<span class="dds-dd__req" aria-hidden="true">*</span>}
        </span>
      }
      <button
        type="button"
        class="dds-dd__trigger"
        [class.dds-dd__trigger--error]="!!error()"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open()"
        [attr.aria-label]="label() ? null : ariaLabel() || null"
        [attr.aria-labelledby]="label() ? labelId : null"
        [disabled]="disabled()"
        (click)="open.set(!open())"
      >
        <span [class.dds-dd__placeholder]="!triggerLabel()">{{ triggerLabel() || placeholder() }}</span>
        <span class="dds-dd__chevron" aria-hidden="true">⌄</span>
      </button>

      @if (open()) {
        <button
          type="button"
          class="dds-dd__backdrop"
          aria-hidden="true"
          tabindex="-1"
          (click)="open.set(false)"
        ></button>
        <div class="dds-dd__panel" role="listbox" [attr.aria-label]="label() || ariaLabel() || null">
          @if (placeholder() && !resetAfterSelect()) {
            <button type="button" role="option" [attr.aria-selected]="!value()" class="dds-dd__opt" (click)="choose('')">
              {{ placeholder() }}
            </button>
          }
          @for (opt of options(); track opt.value) {
            <button
              type="button"
              role="option"
              [attr.aria-selected]="value() === opt.value"
              class="dds-dd__opt"
              [class.dds-dd__opt--action]="opt.action"
              (click)="choose(opt.value)"
            >
              <span>{{ opt.label }}</span>
              @if (!opt.action && value() === opt.value) {
                <span class="dds-dd__check" aria-hidden="true">✓</span>
              }
            </button>
          }
        </div>
      }

      @if (error()) {
        <span class="dds-dd__error" role="alert">{{ error() }}</span>
      }
    </div>
  `,
  styles: [
    `
      .dds-dd {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-1);
        font-family: var(--dds-font-family);
      }
      .dds-dd__label {
        font-size: var(--dds-font-size-sm);
        font-weight: var(--dds-font-weight-medium);
        color: var(--dds-color-ink-strong);
      }
      .dds-dd__req {
        color: var(--dds-color-error);
        margin-left: 2px;
      }
      .dds-dd__trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--dds-space-3);
        min-height: 48px;
        padding: var(--dds-space-3) var(--dds-space-4);
        font-family: inherit;
        font-size: var(--dds-font-size-md);
        color: var(--dds-color-ink-strong);
        background: var(--dds-color-surface);
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-control);
        cursor: pointer;
        text-align: left;
      }
      .dds-dd__trigger:focus-visible {
        outline: none;
        border-color: var(--dds-color-primary-strong);
        box-shadow: var(--dds-focus-ring);
      }
      .dds-dd__trigger--error {
        border-color: var(--dds-color-error);
      }
      .dds-dd__chevron {
        color: var(--dds-color-ink-muted);
      }
      .dds-dd__placeholder {
        color: var(--dds-color-ink-muted);
      }
      .dds-dd__backdrop {
        position: fixed;
        inset: 0;
        z-index: 20;
        background: none;
        border: none;
        cursor: default;
      }
      .dds-dd__panel {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        z-index: 30;
        margin: 0;
        padding: var(--dds-space-2);
        list-style: none;
        background: var(--dds-color-surface);
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-control);
        box-shadow: var(--dds-shadow-card);
        max-height: 320px;
        overflow-y: auto;
      }
      .dds-dd__opt {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--dds-space-3);
        padding: var(--dds-space-3) var(--dds-space-4);
        background: none;
        border: none;
        border-radius: var(--dds-radius-control);
        font: inherit;
        font-size: var(--dds-font-size-md);
        color: var(--dds-color-ink-strong);
        cursor: pointer;
        text-align: left;
      }
      .dds-dd__opt:hover {
        background: var(--dds-color-surface-alt);
      }
      .dds-dd__opt--action {
        color: var(--dds-color-primary);
        font-weight: var(--dds-font-weight-bold);
      }
      .dds-dd__check {
        color: var(--dds-color-ink-strong);
      }
      .dds-dd__error {
        font-size: var(--dds-font-size-xs);
        color: var(--dds-color-error);
      }
    `,
  ],
})
export class DdsDropdown implements ControlValueAccessor {
  readonly labelId = `dds-dd-${uid++}`;
  readonly label = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly placeholder = input<string>('');
  readonly options = input<DdsOption[]>([]);
  readonly required = input(false);
  readonly error = input<string>('');
  readonly resetAfterSelect = input(false);

  readonly selected = output<string>();

  protected readonly open = signal(false);
  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  protected readonly triggerLabel = computed(() => {
    if (this.resetAfterSelect()) {
      return '';
    }
    return this.options().find((o) => o.value === this.value())?.label ?? '';
  });

  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected choose(value: string): void {
    this.open.set(false);
    this.selected.emit(value);
    if (this.resetAfterSelect()) {
      return;
    }
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
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
