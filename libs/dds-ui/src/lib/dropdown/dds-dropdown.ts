import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
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
  host: { '(document:keydown.escape)': 'onDocEscape()' },
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
        #trigger
        type="button"
        class="dds-dd__trigger"
        [class.dds-dd__trigger--error]="!!error()"
        role="combobox"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="open() ? panelId : null"
        [attr.aria-activedescendant]="open() && activeIndex() >= 0 ? optId(activeIndex()) : null"
        [attr.aria-label]="label() ? null : ariaLabel() || null"
        [attr.aria-labelledby]="label() ? labelId : null"
        [disabled]="disabled()"
        (click)="toggle()"
        (keydown)="onKeydown($event)"
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
        <div class="dds-dd__panel" role="listbox" [id]="panelId" [attr.aria-label]="label() || ariaLabel() || null">
          @for (opt of navOptions(); track opt.value; let i = $index) {
            <button
              type="button"
              role="option"
              tabindex="-1"
              [id]="optId(i)"
              [attr.aria-selected]="opt.value ? value() === opt.value : !value()"
              class="dds-dd__opt"
              [class.dds-dd__opt--action]="opt.action"
              [class.dds-dd__opt--active]="activeIndex() === i"
              (mouseenter)="activeIndex.set(i)"
              (click)="choose(opt.value)"
            >
              <span>{{ opt.label }}</span>
              @if (!opt.action && opt.value && value() === opt.value) {
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
      .dds-dd__opt:hover,
      .dds-dd__opt--active {
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
  readonly panelId = `${this.labelId}-panel`;
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
  protected readonly activeIndex = signal(-1);
  private readonly triggerEl = viewChild<ElementRef<HTMLButtonElement>>('trigger');

  /** Options as rendered, with the placeholder ("clear") entry prepended when shown. */
  protected readonly navOptions = computed<DdsOption[]>(() =>
    this.placeholder() && !this.resetAfterSelect()
      ? [{ value: '', label: this.placeholder() }, ...this.options()]
      : this.options(),
  );

  protected readonly triggerLabel = computed(() => {
    if (this.resetAfterSelect()) {
      return '';
    }
    return this.options().find((o) => o.value === this.value())?.label ?? '';
  });

  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected optId(i: number): string {
    return `${this.labelId}-opt-${i}`;
  }

  protected toggle(): void {
    if (this.open()) {
      this.open.set(false);
    } else {
      this.openPanel();
    }
  }

  protected onDocEscape(): void {
    if (this.open()) {
      this.closePanel();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const opts = this.navOptions();
    if (!this.open()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.openPanel();
      }
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.set(Math.min(this.activeIndex() + 1, opts.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(opts.length - 1);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const opt = opts[this.activeIndex()];
        if (opt) {
          this.choose(opt.value);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.closePanel();
        break;
      case 'Tab':
        this.open.set(false);
        break;
    }
  }

  private openPanel(): void {
    const idx = this.navOptions().findIndex((o) => o.value && o.value === this.value());
    this.activeIndex.set(idx >= 0 ? idx : 0);
    this.open.set(true);
  }

  private closePanel(): void {
    this.open.set(false);
    this.triggerEl()?.nativeElement.focus();
  }

  protected choose(value: string): void {
    this.open.set(false);
    this.triggerEl()?.nativeElement.focus();
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
