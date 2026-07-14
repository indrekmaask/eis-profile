import { ProfileView } from '@eis/profile-api';

export type VerdictKind = 'ok' | 'warn' | 'maybe' | 'open' | 'no';
export type Eligibility = 'RULE_BASED' | 'MANUAL' | 'OPEN';

export interface RuleRow {
  icon: '✓' | '✗' | '⚠' | '?' | '○';
  label: string;
  detail?: string;
}

export interface Verdict {
  txt: string;
  kind: VerdictKind;
}

export interface ServiceDef {
  id: string;
  name: string;
  sum: string;
  configured: boolean;
  eligibility: Eligibility;
  intro: string;
  booking: boolean;
  advisorAssessed?: boolean;
  criteria?: string[];
  selfRules?: string[];
  openInfo?: string;
  /** Machine-readable eligibility pre-check (RULE_BASED only). */
  rules?: (p: ProfileView) => RuleRow[];
  /** Extra application-only fields (not reused from profile). */
  specificFields?: { label: string; placeholder?: string; value?: string }[];
}

function latest(p: ProfileView): AnnualLike {
  const r = p.annualReports[0];
  return {
    year: r?.reportYear ?? null,
    revenue: r ? totalRevenue(r) : 0,
    exportRevenue: r ? exportRevenue(r) : 0,
  };
}
interface AnnualLike {
  year: number | null;
  revenue: number;
  exportRevenue: number;
}

type ReportLike = {
  salesRevenueEstonia: number | null;
  salesRevenueEu: number | null;
  salesRevenueNonEu: number | null;
};

export function totalRevenue(r: ReportLike): number {
  return (r.salesRevenueEstonia ?? 0) + (r.salesRevenueEu ?? 0) + (r.salesRevenueNonEu ?? 0);
}
export function exportRevenue(r: ReportLike): number {
  return (r.salesRevenueEu ?? 0) + (r.salesRevenueNonEu ?? 0);
}

/** Total-revenue growth (%) between the two most recent reports; null if not computable. */
export function growth(p: ProfileView): number | null {
  const rows = p.annualReports.slice().sort((a, b) => b.reportYear - a.reportYear);
  if (rows.length < 2) {
    return null;
  }
  const prev = totalRevenue(rows[1]);
  if (!prev) {
    return null;
  }
  return ((totalRevenue(rows[0]) - prev) / prev) * 100;
}

const REGION_LABELS: Record<string, string> = {
  TALLINN: 'Tallinn',
  TARTU: 'Tartu',
  PARNU: 'Pärnu',
  NARVA: 'Narva',
  VILJANDI: 'Viljandi',
  RIGA: 'Riia',
  VILNIUS: 'Vilnius',
  HELSINKI: 'Helsingi',
  STOCKHOLM: 'Stockholm',
};
export function regionList(codes: string[]): string {
  return codes.map((c) => REGION_LABELS[c] ?? c).join(', ');
}

export function money(v: number | null | undefined): string {
  if (v == null) {
    return '—';
  }
  return new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
}

export const SERVICES: ServiceDef[] = [
  {
    id: 'dev',
    name: 'Ettevõtte arenguprogramm',
    sum: 'kuni 500 000 €',
    configured: true,
    eligibility: 'RULE_BASED',
    booking: true,
    intro:
      'Toetus arenguplaani elluviimiseks. Sobivuse eelkontroll tehakse automaatselt profiili ja registriandmete põhjal. Kohustuslik esimene samm on eelnõustamine, kus kliendihaldur täpsustab sobivust ja aitab taotluse ette valmistada.',
    // Automaatne eelkontroll — arvutatud päris andmetest. VTA jääk ja TAIE = "?" (andmeid pole / sõltub taotlusest).
    rules: (p) => {
      const years = p.annualReports.length;
      const exp = latest(p).exportRevenue;
      const g = growth(p);
      const emp = p.employeeCount.value;
      const growthOrExport = (g != null && g >= 5) || exp >= 50000;
      return [
        { icon: '✓', label: 'Ettevõte on Eesti äriregistris', detail: 'profiil põhineb registrikandel' },
        { icon: years >= 2 ? '✓' : '✗', label: 'Tegutsenud vähemalt 2 aastat', detail: `aruandeid ${years}` },
        {
          icon: growthOrExport ? '✓' : '✗',
          label: 'Kasv ≥ 5%/a VÕI eksport ≥ 50 000 €',
          detail: `kasv ${g == null ? '—' : (g >= 0 ? '+' : '') + g.toFixed(1) + '%'}, eksport ${money(exp)} — ${growthOrExport ? 'VÕI täidetud' : 'kumbki ei täidetud'}`,
        },
        {
          icon: emp != null ? (emp >= 8 ? '✓' : '✗') : '?',
          label: 'Vähemalt 8 töötajat',
          detail: emp != null ? `profiilis: ${emp}` : 'lisa töötajate arv profiilile',
        },
        {
          icon: '?',
          label: 'VTA vaba jääk piisav (kuni 300 000 € / 3 a)',
          detail: 'eeltäidetakse tulevikus riigiabi registrist (RAR) — praeguses mock-API-s pole, kontrollib menetleja',
        },
        { icon: '?', label: 'Panustab TAIE fookusvaldkonda', detail: 'projekti sisu — vali taotlusel' },
      ];
    },
  },
];

export function serviceById(id: string): ServiceDef | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function verdict(rows: RuleRow[]): Verdict {
  const bad = rows.filter((r) => r.icon === '✗').length;
  const warn = rows.filter((r) => r.icon === '⚠').length;
  const q = rows.filter((r) => r.icon === '?').length;
  if (bad > 0) {
    return { txt: `Praeguste andmete põhjal tõenäoliselt ei sobi — vaata ${bad} tingimust`, kind: 'no' };
  }
  if (warn > 0) {
    return { txt: 'Võid sobida — üks tingimus on piiripealne', kind: 'warn' };
  }
  if (q > 0) {
    return { txt: 'Tõenäoliselt sobid — täienda paar välja täpsemaks hinnanguks', kind: 'maybe' };
  }
  return { txt: 'Eelhinnang: sobid. Lõpliku otsuse teeb menetleja', kind: 'ok' };
}

/** List-level verdict for a service against a profile. */
export function evaluate(p: ProfileView, s: ServiceDef): Verdict {
  if (s.eligibility === 'OPEN') {
    return { txt: 'Avatud kõigile — eeltingimusi ei kontrollita', kind: 'open' };
  }
  if (s.advisorAssessed) {
    return { txt: 'Sobivust hindab kliendihaldur eelnõustamisel', kind: 'maybe' };
  }
  if (s.eligibility === 'MANUAL') {
    return { txt: 'Hinda ise — reegleid pole veel seadistatud', kind: 'maybe' };
  }
  return verdict(s.rules ? s.rules(p) : []);
}

export function verdictRank(kind: VerdictKind): number {
  return { ok: 0, warn: 1, maybe: 2, open: 3, no: 4 }[kind];
}

export function verdictIcon(kind: VerdictKind): string {
  return { no: '✗', warn: '⚠', ok: '✓', maybe: '~', open: '◇' }[kind];
}
