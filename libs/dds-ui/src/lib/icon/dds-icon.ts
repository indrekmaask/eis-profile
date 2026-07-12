import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DdsIconName =
  | 'file-text'
  | 'trending-up'
  | 'compass'
  | 'users'
  | 'building'
  | 'landmark'
  | 'user'
  | 'globe'
  | 'map-pin'
  | 'euro'
  | 'monitor'
  | 'leaf'
  | 'cpu'
  | 'lightbulb';

/** Lucide-style line icon set (matches the DDS2/Figma icon family). */
@Component({
  selector: 'dds-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('file-text') {
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" />
          <path d="M16 17H8" />
        }
        @case ('trending-up') {
          <path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" />
        }
        @case ('compass') {
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" />
        }
        @case ('users') {
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        }
        @case ('building') {
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" /><path d="M3 21h18" />
          <path d="M9 8h1" /><path d="M9 12h1" /><path d="M9 16h1" />
          <path d="M14 8h1" /><path d="M14 12h1" /><path d="M14 16h1" />
        }
        @case ('landmark') {
          <path d="M3 22h18" /><path d="M6 18v-7" /><path d="M10 18v-7" />
          <path d="M14 18v-7" /><path d="M18 18v-7" /><polygon points="12 2 20 7 4 7" />
        }
        @case ('user') {
          <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
        }
        @case ('globe') {
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
        }
        @case ('map-pin') {
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        }
        @case ('euro') {
          <path d="M4 10h12" /><path d="M4 14h9" />
          <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2" />
        }
        @case ('monitor') {
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <path d="M8 21h8" /><path d="M12 17v4" />
        }
        @case ('leaf') {
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6" />
        }
        @case ('cpu') {
          <rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" />
          <path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" />
          <path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
        }
        @case ('lightbulb') {
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" /><path d="M10 22h4" />
        }
      }
    </svg>
  `,
  host: { class: 'dds-icon' },
  styles: [
    `
      :host {
        display: inline-flex;
      }
      svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class DdsIcon {
  readonly name = input.required<DdsIconName>();
}
