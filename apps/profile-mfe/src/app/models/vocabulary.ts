import { DdsOption } from '@dds/ui';

/**
 * Controlled vocabularies mirroring the backend MarketVocabulary:
 * target markets = ISO 3166-1 alpha-2 (curated common set),
 * operating regions = the fixed OPERATING_REGIONS list.
 */
export const TARGET_MARKETS: DdsOption[] = [
  { value: 'EE', label: 'Eesti' },
  { value: 'FI', label: 'Soome' },
  { value: 'SE', label: 'Rootsi' },
  { value: 'LV', label: 'Läti' },
  { value: 'LT', label: 'Leedu' },
  { value: 'NO', label: 'Norra' },
  { value: 'DK', label: 'Taani' },
  { value: 'DE', label: 'Saksamaa' },
  { value: 'PL', label: 'Poola' },
  { value: 'NL', label: 'Holland' },
  { value: 'FR', label: 'Prantsusmaa' },
  { value: 'GB', label: 'Ühendkuningriik' },
  { value: 'US', label: 'Ameerika Ühendriigid' },
];

export const OPERATING_REGIONS: DdsOption[] = [
  { value: 'TALLINN', label: 'Tallinn' },
  { value: 'TARTU', label: 'Tartu' },
  { value: 'PARNU', label: 'Pärnu' },
  { value: 'NARVA', label: 'Narva' },
  { value: 'VILJANDI', label: 'Viljandi' },
  { value: 'RIGA', label: 'Riia' },
  { value: 'VILNIUS', label: 'Vilnius' },
  { value: 'HELSINKI', label: 'Helsingi' },
  { value: 'STOCKHOLM', label: 'Stockholm' },
];

export function labelFor(options: DdsOption[], code: string): string {
  return options.find((o) => o.value === code)?.label ?? code;
}

export function formatEstonianDate(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat('et-EE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}
