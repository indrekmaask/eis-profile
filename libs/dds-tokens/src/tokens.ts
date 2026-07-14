/**
 * TS mirror of the DDS2 design tokens for JS-driven surfaces (charts, canvas).
 * Keep in sync with _tokens.scss.
 */
export const ddsColors = {
  primary: '#0030DE',
  primaryStrong: '#0062F5',
  registryHighlight: '#CEE2FD',
  registryAccent: '#002D72',
  inkStrong: '#0E172A',
  inkMuted: '#3D4B5E',
  inkSubtle: '#575A5D',
  border: '#E5E5E5',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  success: '#0F8A4F',
  warning: '#B45309',
  error: '#C0392B',
} as const;

export const ddsChartPalette = ['#0030DE', '#0062F5', '#5B8DEF', '#9DBDF0', '#002D72'] as const;

export const ddsSpace = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
} as const;
