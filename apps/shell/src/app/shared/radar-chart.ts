import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-radar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + box() + ' ' + box()"
      class="radar"
      role="img"
      [attr.aria-label]="'Küpsusradar'"
    >
      @for (ring of rings(); track $index) {
        <polygon [attr.points]="ring" class="radar__ring" />
      }
      @for (spoke of spokes(); track $index) {
        <line
          [attr.x1]="center()"
          [attr.y1]="center()"
          [attr.x2]="spoke.x"
          [attr.y2]="spoke.y"
          class="radar__spoke"
        />
      }
      <polygon [attr.points]="valuePoints()" class="radar__area" />
      @for (label of labels(); track $index) {
        <text
          [attr.x]="label.x"
          [attr.y]="label.y"
          [attr.text-anchor]="label.anchor"
          class="radar__label"
        >
          {{ label.text }}
        </text>
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .radar {
        width: 100%;
        height: auto;
        overflow: visible;
        font-family: var(--dds-font-family);
      }
      .radar__ring {
        fill: none;
        stroke: var(--dds-color-border);
        stroke-width: 1;
      }
      .radar__spoke {
        stroke: var(--dds-color-border);
        stroke-width: 1;
      }
      .radar__area {
        fill: color-mix(in srgb, var(--dds-color-primary) 22%, transparent);
        stroke: var(--dds-color-primary);
        stroke-width: 2;
      }
      .radar__label {
        font-size: 12px;
        fill: var(--dds-color-ink-muted);
      }
    `,
  ],
})
export class RadarChart {
  readonly axes = input<string[]>([]);
  /** One value in 0..1 per axis. */
  readonly values = input<number[]>([]);
  readonly size = input<number>(320);

  protected readonly box = computed(() => this.size());
  protected readonly center = computed(() => this.size() / 2);
  private readonly radius = computed(() => this.size() / 2 - 44);
  private readonly levels = 4;

  private point(
    valueRatio: number,
    index: number,
    count: number,
    extraPx = 0,
  ): { x: number; y: number } {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const r = this.radius() * valueRatio + extraPx;
    return {
      x: this.center() + r * Math.cos(angle),
      y: this.center() + r * Math.sin(angle),
    };
  }

  protected readonly rings = computed<string[]>(() => {
    const n = this.axes().length;
    if (n === 0) {
      return [];
    }
    return Array.from({ length: this.levels }, (_, l) => {
      const ratio = (l + 1) / this.levels;
      return Array.from({ length: n }, (_, i) => {
        const p = this.point(ratio, i, n);
        return `${p.x},${p.y}`;
      }).join(' ');
    });
  });

  protected readonly spokes = computed(() => {
    const n = this.axes().length;
    return Array.from({ length: n }, (_, i) => this.point(1, i, n));
  });

  protected readonly valuePoints = computed<string>(() => {
    const n = this.axes().length;
    const v = this.values();
    return Array.from({ length: n }, (_, i) => {
      const p = this.point(Math.max(0, Math.min(1, v[i] ?? 0)), i, n);
      return `${p.x},${p.y}`;
    }).join(' ');
  });

  /** Extra px beyond the axis vertex, clear of the outer ring and chart edge. */
  private readonly labelOffset = 28;

  protected readonly labels = computed(() => {
    const n = this.axes().length;
    return this.axes().map((text, i) => {
      const p = this.point(1, i, n, this.labelOffset);
      const dx = p.x - this.center();
      const anchor = Math.abs(dx) < 4 ? 'middle' : dx > 0 ? 'start' : 'end';
      return { text, x: p.x, y: p.y, anchor };
    });
  });
}
