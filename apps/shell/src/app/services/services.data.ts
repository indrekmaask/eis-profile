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
  return { year: r?.reportYear ?? null, revenue: r?.salesRevenueEstonia ?? 0 };
}
interface AnnualLike {
  year: number | null;
  revenue: number;
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
    id: 'start',
    name: 'Starditoetus',
    sum: 'kuni 20 000 €',
    configured: true,
    eligibility: 'RULE_BASED',
    booking: false,
    intro:
      'Toetus alustavale ettevõtjale. Kõlblikkuse eelhinnang põhineb ühel tingimusel: eelnenud majandusaasta müügitulu kuni 40 000 €. Muud tingimused (vanus, töötajad, tegevusala) hindab eelnõustamine.',
    rules: (p) => {
      const r = latest(p);
      const ok = r.revenue <= 40000;
      return [
        {
          icon: ok ? '✓' : '✗',
          label: 'Müügitulu kuni 40 000 € (eelnenud majandusaasta)',
          detail: `${r.year ?? '—'}: ${money(r.revenue)}${ok ? ' — sobib' : ' — ületab 40 000 € piiri, ei kvalifitseeru'}`,
        },
      ];
    },
    specificFields: [
      { label: 'Projekti kirjeldus *', placeholder: 'Milleks toetust kasutad?' },
      { label: 'Loodavate töökohtade arv *', placeholder: 'nt 1' },
      { label: 'Taotletav summa', value: '20 000 €' },
    ],
  },
  {
    id: 'dev',
    name: 'Ettevõtte arenguprogramm',
    sum: 'kuni 500 000 €',
    configured: true,
    eligibility: 'RULE_BASED',
    booking: true,
    advisorAssessed: true,
    intro:
      'Toetus arenguplaani elluviimiseks. Kohustuslik eelnõustamine (EIS); sobivust hindab kliendihaldur eelnõustamisel, seejärel esitatakse taotlus e-toetuse keskkonnas.',
    criteria: [
      'Eesti äriregistris registreeritud',
      'Tegutsenud vähemalt 2 aastat',
      'Vähemalt 8 töötajat',
      'Eksport ≥ 50 000 € VÕI müügitulu kasv ≥ 5%/a',
      'Panustab TAIE fookusvaldkonda',
      'Panustab vähemalt ühte kolmikpöörde suunda (innovatsioon / digitaliseerimine / kestlik areng)',
    ],
  },
  {
    id: 'digi',
    name: 'Digitaliseerimise teekaardi toetus',
    sum: 'kuni 15 000 €',
    configured: false,
    eligibility: 'MANUAL',
    booking: false,
    intro:
      'Toetus ettevõtte digipöörde kavandamiseks. Selle teenuse kõlblikkusreegleid ei ole veel süsteemi konfigureeritud — hinda sobivust ise tingimuste järgi.',
    selfRules: [
      'Kahe viimase aasta keskmine müügitulu vähemalt 200 000 €',
      'Ettevõte on tegutsenud vähemalt 3 aastat',
      'Tegevusala ei kuulu välistatud sektorite hulka',
      'Ei ole saanud sama toetust viimase 3 aasta jooksul',
    ],
  },
  {
    id: 'toit',
    name: 'Toiduinnovatsiooni programm',
    sum: 'programm · liitumine',
    configured: false,
    eligibility: 'OPEN',
    booking: false,
    intro:
      'Programm ühendab EIS-i teenused toidu- ja biotehnoloogia sektori arendamiseks. Osaleda saavad kõik toiduvaldkonda panustavad ettevõtjad — tegevusvaldkondade piiranguteta. Kõlblikkust ei arvutata; liitumisvorm eeltäidetakse sinu profiilist.',
    openInfo:
      'Avatud kõigile — eeltingimusi ei kontrollita. Liitu lihtsa vormiga (eeltäidetud sinu profiilist).',
  },
  {
    id: 'turism',
    name: 'Turismiettevõtja arengutoetus',
    sum: 'kuni 30 000 €',
    configured: true,
    eligibility: 'RULE_BASED',
    booking: false,
    intro:
      'Toetus turismisektori ettevõtjatele. Kõlblikkus põhineb ühel tingimusel: tegevusala kuulub turismi (EMTAK 55/56/79).',
    rules: (p) => {
      const code = p.emtakCode.value ?? '';
      const tourism = /^(55|56|79)/.test(code);
      return [
        {
          icon: tourism ? '✓' : '✗',
          label: 'Tegevusala kuulub turismi (EMTAK 55/56/79)',
          detail: tourism ? `EMTAK ${code} — turism ✓` : `EMTAK ${code} — ei kuulu turismi`,
        },
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
