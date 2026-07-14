import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DdsOption } from '../dropdown/dds-dropdown';

/**
 * Tag input bound to a controlled vocabulary (markets / regions).
 * Value = array of selected option codes; free text is not allowed.
 */
@Component({
  selector: 'dds-tag-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DdsTagInput), multi: true },
  ],
  template: `
    <label class="dds-field">
      @if (label()) {
        <span class="dds-field__label">
          {{ label() }}@if (required()) {<span class="dds-field__req" aria-hidden="true">*</span>}
        </span>
      }
      <div class="dds-field__box">
        @for (opt of selectedOptions(); track opt.value) {
          <span class="dds-tags__chip">
            <span>{{ opt.label }}</span>
            <button
              type="button"
              class="dds-tags__remove"
              [attr.aria-label]="'Eemalda ' + opt.label"
              [disabled]="disabled()"
              (click)="remove(opt.value)"
            >
              ×
            </button>
          </span>
        }
        @if (available().length) {
          <select
            class="dds-field__control"
            [disabled]="disabled()"
            [attr.aria-label]="label() || ariaLabel() || null"
            (change)="add($event)"
          >
            <option value="" selected hidden>{{ selectedOptions().length ? '' : placeholder() || 'Lisa…' }}</option>
            @for (opt of available(); track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
          <span class="dds-field__chevron" aria-hidden="true">▾</span>
        }
      </div>
    </label>
  `,
  styles: [
    `
      .dds-field {
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-2);
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
      .dds-field__box {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--dds-space-2);
        background: var(--dds-color-surface);
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-control);
        padding: var(--dds-space-2) var(--dds-space-6) var(--dds-space-2) var(--dds-space-3);
        min-height: 48px;
      }
      .dds-field__box:focus-within {
        border-color: var(--dds-color-primary-strong);
        box-shadow: var(--dds-focus-ring);
      }
      .dds-tags__chip {
        display: inline-flex;
        align-items: center;
        gap: var(--dds-space-2);
        background: var(--dds-color-registry-highlight);
        color: var(--dds-color-registry-accent);
        border-radius: var(--dds-radius-pill);
        padding: var(--dds-space-1) var(--dds-space-2) var(--dds-space-1) var(--dds-space-3);
        font-size: var(--dds-font-size-sm);
      }
      .dds-tags__remove {
        background: none;
        border: none;
        cursor: pointer;
        font-size: var(--dds-font-size-md);
        line-height: 1;
        color: var(--dds-color-registry-accent);
        padding: 0 var(--dds-space-1);
      }
      .dds-field__control {
        appearance: none;
        flex: 1;
        min-width: 120px;
        font-family: inherit;
        font-size: var(--dds-font-size-md);
        background: transparent;
        border: none;
        padding: var(--dds-space-2) 0;
        color: var(--dds-color-ink-muted);
      }
      .dds-field__control:focus {
        outline: none;
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
export class DdsTagInput implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly placeholder = input<string>('');
  readonly options = input<DdsOption[]>([]);
  readonly required = input(false);

  protected readonly selected = signal<string[]>([]);
  protected readonly disabled = signal(false);

  protected readonly selectedOptions = computed(() => {
    const opts = this.options();
    return this.selected()
      .map((v) => opts.find((o) => o.value === v) ?? { value: v, label: v })
      .filter(Boolean);
  });
  protected readonly available = computed(() => {
    const chosen = new Set(this.selected());
    return this.options().filter((o) => !chosen.has(o.value));
  });

  private onChange: (v: string[]) => void = () => {};
  protected onTouched: () => void = () => {};

  protected add(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const v = select.value;
    if (v && !this.selected().includes(v)) {
      this.selected.update((cur) => [...cur, v]);
      this.onChange(this.selected());
      this.onTouched();
    }
    select.value = '';
  }
  protected remove(value: string): void {
    this.selected.update((cur) => cur.filter((v) => v !== value));
    this.onChange(this.selected());
    this.onTouched();
  }

  writeValue(v: string[]): void {
    this.selected.set(Array.isArray(v) ? v : []);
  }
  registerOnChange(fn: (v: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
