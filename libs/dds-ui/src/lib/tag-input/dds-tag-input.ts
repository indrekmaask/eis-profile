import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DdsOption } from '../dropdown/dds-dropdown';

let uid = 0;

/**
 * Tag input bound to a controlled vocabulary (markets / regions).
 * Value = array of selected option codes; free text is not allowed.
 */
@Component({
  selector: 'dds-tag-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onDocEscape()' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DdsTagInput), multi: true },
  ],
  template: `
    <div class="dds-ms">
      @if (label()) {
        <span class="dds-ms__label">
          {{ label() }}@if (required()) {<span class="dds-ms__req" aria-hidden="true">*</span>}
        </span>
      }
      <div class="dds-ms__control">
        @for (opt of selectedOptions(); track opt.value) {
          <span class="dds-ms__chip">
            <span>{{ opt.label }}</span>
            <button
              type="button"
              class="dds-ms__remove"
              [attr.aria-label]="'Eemalda ' + opt.label"
              [disabled]="disabled()"
              (click)="remove(opt.value)"
            >
              ×
            </button>
          </span>
        }
        <button
          #trigger
          type="button"
          class="dds-ms__add"
          role="combobox"
          aria-haspopup="listbox"
          [attr.aria-expanded]="open()"
          [attr.aria-controls]="open() ? panelId : null"
          [attr.aria-activedescendant]="open() && activeIndex() >= 0 ? optId(activeIndex()) : null"
          [attr.aria-label]="label() || ariaLabel() || null"
          [disabled]="disabled() || !available().length"
          (click)="toggle()"
          (keydown)="onKeydown($event)"
        >
          @if (!selectedOptions().length) {
            <span class="dds-ms__placeholder">{{ placeholder() || 'Lisa…' }}</span>
          }
          <span class="dds-ms__chevron" aria-hidden="true">⌄</span>
        </button>
      </div>

      @if (open() && available().length) {
        <button type="button" class="dds-ms__backdrop" aria-hidden="true" tabindex="-1" (click)="open.set(false)"></button>
        <div class="dds-ms__panel" role="listbox" aria-multiselectable="true" [id]="panelId"
          [attr.aria-label]="label() || ariaLabel() || null">
          @for (opt of available(); track opt.value; let i = $index) {
            <button
              type="button"
              role="option"
              tabindex="-1"
              aria-selected="false"
              [id]="optId(i)"
              class="dds-ms__opt"
              [class.dds-ms__opt--active]="activeIndex() === i"
              (mouseenter)="activeIndex.set(i)"
              (click)="addValue(opt.value)"
            >
              {{ opt.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .dds-ms {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-2);
        font-family: var(--dds-font-family);
      }
      .dds-ms__label {
        font-size: var(--dds-font-size-sm);
        font-weight: var(--dds-font-weight-medium);
      }
      .dds-ms__req {
        color: var(--dds-color-error);
        margin-left: 2px;
      }
      .dds-ms__control {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--dds-space-2);
        background: var(--dds-color-surface);
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-control);
        padding: var(--dds-space-2) var(--dds-space-3);
        min-height: 48px;
      }
      .dds-ms__control:focus-within {
        border-color: var(--dds-color-primary-strong);
        box-shadow: var(--dds-focus-ring);
      }
      .dds-ms__chip {
        display: inline-flex;
        align-items: center;
        gap: var(--dds-space-2);
        background: var(--dds-color-registry-highlight);
        color: var(--dds-color-registry-accent);
        border-radius: var(--dds-radius-pill);
        padding: var(--dds-space-1) var(--dds-space-2) var(--dds-space-1) var(--dds-space-3);
        font-size: var(--dds-font-size-sm);
      }
      .dds-ms__remove {
        background: none;
        border: none;
        cursor: pointer;
        font-size: var(--dds-font-size-md);
        line-height: 1;
        color: var(--dds-color-registry-accent);
        padding: 0 var(--dds-space-1);
      }
      .dds-ms__add {
        flex: 1;
        min-width: 80px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--dds-space-2);
        background: none;
        border: none;
        padding: var(--dds-space-2) 0;
        font: inherit;
        font-size: var(--dds-font-size-md);
        color: var(--dds-color-ink-strong);
        cursor: pointer;
        text-align: left;
      }
      .dds-ms__add:disabled {
        cursor: default;
      }
      .dds-ms__placeholder {
        color: var(--dds-color-ink-muted);
      }
      .dds-ms__chevron {
        margin-left: auto;
        color: var(--dds-color-ink-muted);
      }
      .dds-ms__backdrop {
        position: fixed;
        inset: 0;
        z-index: 20;
        background: none;
        border: none;
        cursor: default;
      }
      .dds-ms__panel {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        z-index: 30;
        padding: var(--dds-space-2);
        background: var(--dds-color-surface);
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-control);
        box-shadow: var(--dds-shadow-card);
        max-height: 320px;
        overflow-y: auto;
      }
      .dds-ms__opt {
        width: 100%;
        display: block;
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
      .dds-ms__opt:hover,
      .dds-ms__opt--active {
        background: var(--dds-color-surface-alt);
      }
    `,
  ],
})
export class DdsTagInput implements ControlValueAccessor {
  readonly panelId = `dds-ms-panel-${uid++}`;
  readonly label = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly placeholder = input<string>('');
  readonly options = input<DdsOption[]>([]);
  readonly required = input(false);

  protected readonly open = signal(false);
  protected readonly selected = signal<string[]>([]);
  protected readonly disabled = signal(false);
  protected readonly activeIndex = signal(-1);
  private readonly triggerEl = viewChild<ElementRef<HTMLButtonElement>>('trigger');

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

  protected optId(i: number): string {
    return `${this.panelId}-opt-${i}`;
  }

  protected toggle(): void {
    if (this.open()) {
      this.open.set(false);
    } else {
      this.activeIndex.set(0);
      this.open.set(true);
    }
  }

  protected onDocEscape(): void {
    if (this.open()) {
      this.open.set(false);
      this.triggerEl()?.nativeElement.focus();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const opts = this.available();
    if (!this.open()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.activeIndex.set(0);
        this.open.set(true);
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
          this.addValue(opt.value);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.open.set(false);
        this.triggerEl()?.nativeElement.focus();
        break;
      case 'Tab':
        this.open.set(false);
        break;
    }
  }

  protected addValue(v: string): void {
    if (v && !this.selected().includes(v)) {
      this.selected.update((cur) => [...cur, v]);
      this.onChange(this.selected());
      this.onTouched();
    }
    // The picked option leaves the list: clamp the active index and restore
    // focus to the trigger (a mouse click focused the now-removed button).
    const left = this.available().length;
    this.activeIndex.set(left ? Math.min(this.activeIndex(), left - 1) : -1);
    this.triggerEl()?.nativeElement.focus();
    if (!left) {
      this.open.set(false);
    }
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
