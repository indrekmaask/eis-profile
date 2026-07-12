import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { DdsButton } from '@dds/ui';
import { ProfileApiService, ProfileView } from '@eis/profile-api';
import { IdentityService } from '../identity/identity.service';
import {
  RuleRow,
  ServiceDef,
  Verdict,
  money,
  regionList,
  serviceById,
  verdict,
  verdictIcon,
} from './services.data';

interface PanelRow {
  icon: string;
  kind: 'ok' | 'no' | 'warn' | 'maybe' | 'open' | 'info';
  label: string;
  detail?: string;
}
interface Field {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-service-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DdsButton],
  template: `
    <div class="sd">
      @if (service(); as s) {
        <nav class="sd__crumb">Peamine / Minu teenused / {{ s.name }}</nav>
        <a class="sd__back" routerLink="/services">‹ tagasi teenuste juurde</a>
        <h1>{{ s.name }}</h1>
        <div class="sd__sum">{{ s.sum }}</div>
        <p class="sd__lead">{{ s.intro }}</p>

        @if (loading()) {
          <p class="sd__muted">Laen andmeid…</p>
        } @else if (profileMissing()) {
          <div class="sd__empty">
            <h2>Koosta esmalt profiil</h2>
            <p>Taotlemiseks vajab süsteem ettevõtte profiili.</p>
            <a dds-button variant="primary" size="sm" routerLink="/profile" [queryParams]="profileParams()">Koosta profiil →</a>
          </div>
        } @else if (profile()) {
          <div class="sd__cols">
            <div class="sd__main">
              @if (s.booking) {
                <div class="card card--accent">
                  <div class="card__head">
                    <h3>Sinu järgmine samm: eelnõustamine</h3>
                    <span class="pill pill--blue">1. samm teekonnal</span>
                  </div>
                  <p>
                    Arenguprogramm on mitmeetapiline teekond (eelnõustamine → kaardistamine →
                    arenguplaan → elluviimine → hindamine). Kohustuslik esimene samm on
                    <b>eelnõustamine</b>, kus sulle määratakse kliendihaldur.
                  </p>
                  <a dds-button variant="primary" size="sm" routerLink="/programme">Registreeru eelnõustamisele →</a>
                </div>
              } @else {
                <div class="zone">
                  Need on meil juba olemas <span class="zone__sub">· registrist ja profiilist</span>
                  @if (missingCount() === 0) {
                    <span class="zstatus zstatus--done">✓ täidetud</span>
                  } @else {
                    <span class="zstatus zstatus--todo">⚠ {{ missingCount() }} välja puudu</span>
                  }
                </div>

                <div class="card">
                  <div class="card__head"><h3>Taotleja — Äriregistrist</h3><span class="src src--locked">🔒 eeltäidetud</span></div>
                  @for (f of registerFields(); track f.label) {
                    <div class="frow"><span class="fk">{{ f.label }}</span><span class="fv">{{ f.value }}</span></div>
                  }
                </div>

                <div class="card">
                  <div class="card__head"><h3>Taotleja — sinu profiilist</h3><span class="src">✎ once-only</span></div>
                  @for (f of profileFields(); track f.label) {
                    <div class="frow">
                      <span class="fk">{{ f.label }}</span>
                      @if (f.value) {
                        <span class="fv">{{ f.value }} <span class="from">✓ profiilist</span></span>
                      } @else {
                        <span class="fv fv--empty">täitmata — täida profiilis</span>
                      }
                    </div>
                  }
                  <p class="card__note">
                    Eeltäidetud profiilist — peamine kontakt ja konto valitakse automaatselt.
                  </p>
                </div>

                @if (s.specificFields?.length) {
                  <div class="zone">Ainult selle taotluse jaoks <span class="zone__sub">· täida siin</span><span class="zstatus zstatus--todo">täitmata</span></div>
                  <div class="card">
                    <div class="card__head"><h3>Ainult selle taotluse jaoks</h3><span class="src">ei tule profiilist</span></div>
                    @for (f of s.specificFields; track f.label) {
                      <div class="frow">
                        <span class="fk">{{ f.label }}</span>
                        <input class="fin" [value]="f.value || ''" [placeholder]="f.placeholder || ''" />
                      </div>
                    }
                  </div>
                }

                <div class="sd__cta">
                  <button dds-button variant="primary" (click)="openReview()">{{ ctaLabel() }}</button>
                  @if (panelVerdict().kind === 'no') {
                    <p class="sd__help">
                      Eelhinnangu järgi mõni tingimus ei täitu, kuid võid soovi korral siiski esitada —
                      lõpliku otsuse teeb menetleja.
                    </p>
                  }
                </div>
              }
            </div>

            <aside class="sd__side">
              <div class="qual">
                <div class="qual__head"><span>Sobivuse eelkontroll</span><span>automaatne</span></div>
                @for (r of panelRows(); track $index) {
                  <div class="qrow">
                    <span class="qi qi--{{ r.kind }}">{{ r.icon }}</span>
                    <span class="qtext">
                      <span class="ql">{{ r.label }}</span>
                      @if (r.detail) { <span class="qd">{{ r.detail }}</span> }
                    </span>
                  </div>
                }
                <div class="qsum qsum--{{ panelVerdict().kind }}">
                  {{ vIcon(panelVerdict().kind) }} {{ panelVerdict().txt }}
                </div>
              </div>
            </aside>
          </div>
        }
      } @else {
        <p class="sd__muted">Teenust ei leitud.</p>
      }
    </div>

    @if (showReview()) {
      <div class="overlay" (click)="showReview.set(false)">
        <div class="panel" (click)="$event.stopPropagation()">
          <div class="panel__head">
            <h2>Vaata üle enne esitamist</h2>
            <button class="panel__close" (click)="showReview.set(false)">✕</button>
          </div>
          <div class="banner">
            <b>{{ autoCount() }} välja</b> tuli automaatselt — registrist ja sinu profiilist.
            Täitsid ise ainult <b>{{ manualCount() }}</b> sisulist välja. Once-only säästis topelttööd.
          </div>
          <div class="rev__sec">Äriregistrist ({{ registerFields().length }}) — mock-API</div>
          @for (f of registerFields(); track f.label) {
            <div class="rev__row"><span>{{ f.label }}</span><span class="src src--locked">🔒 automaatne</span></div>
          }
          <div class="rev__sec">Sinu profiilist ({{ profileFields().length }})</div>
          @for (f of profileFields(); track f.label) {
            <div class="rev__row"><span>{{ f.label }}</span><span class="src">✎ profiilist</span></div>
          }
          @if (service()?.specificFields?.length) {
            <div class="rev__sec">Täitsid taotluse jaoks ({{ manualCount() }})</div>
            @for (f of service()!.specificFields!; track f.label) {
              <div class="rev__row"><span>{{ f.label }}</span><span class="src">käsitsi · ei salvestu profiili</span></div>
            }
          }
          <div class="sd__cta">
            <button dds-button variant="primary" (click)="confirm()">{{ confirmLabel() }}</button>
            <button dds-button variant="ghost" (click)="showReview.set(false)">Tagasi</button>
          </div>
          @if (submitted()) {
            <p class="sd__ok" role="status">✓ Esitatud (näidis). Andmed võeti registrist ja profiilist.</p>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .sd {
        max-width: var(--dds-width-block);
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-2);
      }
      .sd__crumb {
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      .sd__back {
        color: var(--dds-color-primary);
        text-decoration: none;
        font-size: var(--dds-font-size-sm);
        width: fit-content;
      }
      h1 {
        margin: var(--dds-space-2) 0 0;
        font-size: var(--dds-font-size-2xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .sd__sum {
        color: var(--dds-color-ink-muted);
      }
      .sd__lead {
        margin: var(--dds-space-2) 0 var(--dds-space-3);
        max-width: 760px;
        color: var(--dds-color-ink-muted);
      }
      .sd__muted {
        color: var(--dds-color-ink-muted);
      }
      .sd__cols {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: var(--dds-space-4);
        align-items: start;
      }
      .sd__main {
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-3);
      }
      .card {
        background: var(--dds-color-surface);
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-card);
        padding: var(--dds-space-5);
      }
      .card--accent {
        border-color: var(--dds-color-primary);
      }
      .card--accent p {
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
        margin: var(--dds-space-2) 0 var(--dds-space-4);
      }
      .card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--dds-space-3);
        margin-bottom: var(--dds-space-3);
      }
      .card__head h3 {
        margin: 0;
        font-size: var(--dds-font-size-md);
        font-weight: var(--dds-font-weight-bold);
      }
      .card__note {
        margin: var(--dds-space-3) 0 0;
        font-size: var(--dds-font-size-xs);
        color: var(--dds-color-ink-subtle);
      }
      .src {
        font-size: var(--dds-font-size-xs);
        color: var(--dds-color-ink-muted);
        background: var(--dds-color-surface-alt);
        padding: 2px var(--dds-space-2);
        border-radius: var(--dds-radius-pill);
        white-space: nowrap;
      }
      .frow {
        display: flex;
        justify-content: space-between;
        gap: var(--dds-space-4);
        padding: var(--dds-space-2) 0;
        border-top: 1px solid var(--dds-color-border);
        font-size: var(--dds-font-size-sm);
      }
      .frow:first-of-type {
        border-top: none;
      }
      .fk {
        color: var(--dds-color-ink-muted);
      }
      .fv {
        text-align: right;
      }
      .fv--empty {
        color: var(--dds-color-warning);
      }
      .from {
        color: var(--dds-color-success);
        font-size: var(--dds-font-size-xs);
      }
      .fin {
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-control);
        padding: var(--dds-space-1) var(--dds-space-2);
        font: inherit;
        max-width: 220px;
      }
      .zone {
        display: flex;
        align-items: center;
        gap: var(--dds-space-2);
        font-weight: var(--dds-font-weight-bold);
        font-size: var(--dds-font-size-sm);
        margin-top: var(--dds-space-2);
      }
      .zone__sub {
        color: var(--dds-color-ink-subtle);
        font-weight: var(--dds-font-weight-regular);
      }
      .zstatus {
        margin-left: auto;
        font-size: var(--dds-font-size-xs);
        padding: 2px var(--dds-space-2);
        border-radius: var(--dds-radius-pill);
      }
      .zstatus--done {
        background: var(--dds-color-success-bg);
        color: var(--dds-color-success);
      }
      .zstatus--todo {
        background: var(--dds-color-warning-bg);
        color: var(--dds-color-warning);
      }
      .sd__cta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--dds-space-3);
        margin-top: var(--dds-space-3);
      }
      .sd__help {
        flex-basis: 100%;
        margin: 0;
        font-size: var(--dds-font-size-xs);
        color: var(--dds-color-ink-subtle);
      }
      .pill {
        font-size: var(--dds-font-size-xs);
        padding: 2px var(--dds-space-3);
        border-radius: var(--dds-radius-pill);
      }
      .pill--blue {
        background: var(--dds-color-registry-highlight);
        color: var(--dds-color-registry-accent);
      }
      /* eligibility panel */
      .qual {
        background: var(--dds-color-surface);
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-card);
        padding: var(--dds-space-4);
      }
      .qual__head {
        display: flex;
        justify-content: space-between;
        font-size: var(--dds-font-size-xs);
        color: var(--dds-color-ink-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: var(--dds-space-3);
      }
      .qrow {
        display: flex;
        gap: var(--dds-space-3);
        padding: var(--dds-space-2) 0;
      }
      .qi {
        flex: none;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: var(--dds-font-weight-bold);
      }
      .qi--ok {
        background: var(--dds-color-success-bg);
        color: var(--dds-color-success);
      }
      .qi--no {
        background: var(--dds-color-error-bg);
        color: var(--dds-color-error);
      }
      .qi--warn {
        background: var(--dds-color-warning-bg);
        color: var(--dds-color-warning);
      }
      .qi--maybe,
      .qi--open,
      .qi--info {
        background: var(--dds-color-surface-alt);
        color: var(--dds-color-ink-muted);
      }
      .ql {
        display: block;
        font-size: var(--dds-font-size-sm);
        font-weight: var(--dds-font-weight-medium);
      }
      .qd {
        display: block;
        font-size: var(--dds-font-size-xs);
        color: var(--dds-color-ink-muted);
      }
      .qsum {
        margin-top: var(--dds-space-3);
        padding-top: var(--dds-space-3);
        border-top: 1px solid var(--dds-color-border);
        font-size: var(--dds-font-size-sm);
        font-weight: var(--dds-font-weight-medium);
      }
      .qsum--no {
        color: var(--dds-color-error);
      }
      .qsum--warn {
        color: var(--dds-color-warning);
      }
      .sd__empty {
        background: var(--dds-color-surface);
        border-radius: var(--dds-radius-card);
        box-shadow: var(--dds-shadow-card);
        padding: var(--dds-space-6);
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-3);
        align-items: flex-start;
      }
      .sd__empty h2 {
        margin: 0;
        font-size: var(--dds-font-size-xl);
      }
      /* review overlay */
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(14, 23, 42, 0.45);
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: var(--dds-space-6) var(--dds-space-4);
        overflow: auto;
        z-index: 50;
      }
      .panel {
        background: var(--dds-color-surface);
        border-radius: var(--dds-radius-card);
        max-width: 560px;
        width: 100%;
        padding: var(--dds-space-6);
      }
      .panel__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .panel__head h2 {
        margin: 0;
        font-size: var(--dds-font-size-xl);
      }
      .panel__close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: var(--dds-color-ink-muted);
      }
      .banner {
        background: var(--dds-color-registry-highlight);
        color: var(--dds-color-registry-accent);
        border-radius: var(--dds-radius-control);
        padding: var(--dds-space-3) var(--dds-space-4);
        font-size: var(--dds-font-size-sm);
        margin: var(--dds-space-4) 0;
      }
      .rev__sec {
        font-size: var(--dds-font-size-xs);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--dds-color-ink-muted);
        margin: var(--dds-space-4) 0 var(--dds-space-2);
      }
      .rev__row {
        display: flex;
        justify-content: space-between;
        gap: var(--dds-space-3);
        padding: var(--dds-space-2) 0;
        border-top: 1px solid var(--dds-color-border);
        font-size: var(--dds-font-size-sm);
      }
      .sd__ok {
        margin: var(--dds-space-4) 0 0;
        color: var(--dds-color-success);
        font-weight: var(--dds-font-weight-medium);
      }
      @media (max-width: 900px) {
        .sd__cols {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ServiceDetail {
  protected readonly identity = inject(IdentityService);
  private readonly api = inject(ProfileApiService);
  private readonly route = inject(ActivatedRoute);

  private readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), {
    initialValue: '',
  });
  protected readonly service = computed<ServiceDef | undefined>(() => serviceById(this.id()));

  protected readonly loading = signal(true);
  protected readonly profileMissing = signal(false);
  protected readonly profile = signal<ProfileView | null>(null);
  protected readonly showReview = signal(false);
  protected readonly submitted = signal(false);

  protected readonly profileParams = computed(() => ({
    rc: this.identity.activeCompany()?.registryCode ?? '',
    person: this.identity.personCode(),
  }));

  private readonly primaryContact = computed(() => {
    const p = this.profile();
    return p ? (p.contacts.find((c) => c.primary) ?? p.contacts[0] ?? null) : null;
  });
  private readonly primaryIban = computed(() => {
    const p = this.profile();
    if (!p) {
      return null;
    }
    return (p.bankAccounts.find((b) => b.primary) ?? p.bankAccounts[0])?.iban ?? null;
  });

  protected readonly registerFields = computed<Field[]>(() => {
    const p = this.profile();
    if (!p) {
      return [];
    }
    const r = p.annualReports[0];
    return [
      { label: 'Ärinimi', value: p.businessName.value },
      { label: 'Registrikood', value: p.registryCode },
      {
        label: 'Tegevusala',
        value: p.emtakName.value ? `${p.emtakCode.value} — ${p.emtakName.value}` : p.emtakCode.value,
      },
      { label: `Müügitulu (${r?.reportYear ?? '—'})`, value: money(r?.salesRevenueEstonia) },
    ];
  });

  protected readonly profileFields = computed<Field[]>(() => {
    const p = this.profile();
    if (!p) {
      return [];
    }
    const c = this.primaryContact();
    const fields: Field[] = [
      { label: 'Kontaktisik', value: c?.fullName ?? null },
      { label: 'E-post', value: c?.email ?? null },
      { label: 'Telefon', value: c?.phone ?? null },
    ];
    if (this.id() === 'start') {
      fields.push({ label: 'Töötajate arv', value: p.employeeCount.value != null ? String(p.employeeCount.value) : null });
      fields.push({
        label: 'Tegevuspiirkond',
        value: p.cards.operatingRegions.length ? regionList(p.cards.operatingRegions) : null,
      });
    }
    fields.push({ label: 'Pangakonto (IBAN)', value: this.primaryIban() });
    return fields;
  });

  protected readonly missingCount = computed(
    () => this.profileFields().filter((f) => !f.value).length,
  );
  protected readonly autoCount = computed(() => this.registerFields().length + this.profileFields().length);
  protected readonly manualCount = computed(() => this.service()?.specificFields?.length ?? 0);

  protected readonly panelRows = computed<PanelRow[]>(() => {
    const s = this.service();
    const p = this.profile();
    if (!s || !p) {
      return [];
    }
    if (s.eligibility === 'OPEN') {
      return [{ icon: '◇', kind: 'open', label: 'Avatud kõigile', detail: s.openInfo }];
    }
    if (s.advisorAssessed) {
      return [
        {
          icon: '○',
          kind: 'info',
          label: 'Sobivust hindab kliendihaldur eelnõustamisel',
          detail: 'Süsteem ei arvuta kõlblikkust automaatselt — sobivus selgub eelnõustamises. Allpool on tingimused teadmiseks.',
        },
        ...(s.criteria ?? []).map<PanelRow>((t) => ({ icon: '○', kind: 'info', label: t })),
      ];
    }
    if (s.eligibility === 'MANUAL') {
      return (s.selfRules ?? []).map<PanelRow>((t) => ({ icon: '○', kind: 'info', label: t }));
    }
    return (s.rules ? s.rules(p) : []).map<PanelRow>((r: RuleRow) => ({
      icon: r.icon,
      kind: r.icon === '✓' ? 'ok' : r.icon === '✗' ? 'no' : r.icon === '⚠' ? 'warn' : 'info',
      label: r.label,
      detail: r.detail,
    }));
  });

  protected readonly panelVerdict = computed<Verdict>(() => {
    const s = this.service();
    const p = this.profile();
    if (!s || !p) {
      return { txt: '', kind: 'maybe' };
    }
    if (s.eligibility === 'OPEN') {
      return { txt: 'Avatud kõigile — liitu vabalt', kind: 'open' };
    }
    if (s.advisorAssessed) {
      return { txt: 'Sobivust hindab kliendihaldur — registreeru eelnõustamisele', kind: 'maybe' };
    }
    if (s.eligibility === 'MANUAL') {
      return { txt: 'Hinda ise — reegleid pole veel seadistatud', kind: 'maybe' };
    }
    return verdict(s.rules ? s.rules(p) : []);
  });

  protected readonly ctaLabel = computed(() => {
    const v = this.panelVerdict();
    if (v.kind === 'open') {
      return 'Liitu programmiga →';
    }
    if (v.kind === 'no') {
      return 'Esita siiski →';
    }
    return 'Vaata üle ja esita →';
  });
  protected readonly confirmLabel = computed(() =>
    this.panelVerdict().kind === 'open' ? 'Liitu programmiga →' : 'Kinnita ja suundu e-toetusse →',
  );

  constructor() {
    const company = this.identity.activeCompany();
    if (!company) {
      this.loading.set(false);
      return;
    }
    this.api.getProfile(company.registryCode).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.profileMissing.set(err.status === 404);
        this.loading.set(false);
      },
    });
  }

  protected vIcon(kind: Verdict['kind']): string {
    return verdictIcon(kind);
  }
  protected openReview(): void {
    this.submitted.set(false);
    this.showReview.set(true);
  }
  protected confirm(): void {
    this.submitted.set(true);
  }
}
