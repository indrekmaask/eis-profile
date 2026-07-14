import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IdentityService } from './identity.service';

const DEMO_PEOPLE = [
  { code: '48505150220', name: 'Eva Tamm', label: 'Eva Tamm — Biomarket, Porgand & Karu Koobas OÜ' },
];

/**
 * Mock dev login styled after the Estonian TARA authentication page (see docs/figma-refs/figma-02.png).
 * No real TARA/RIA — the coat-of-arms and EU/Estonia footer logos below are schematic placeholders,
 * not the licensed assets. Only "Mobiil-ID" does anything; the other tabs and the "Telefoninumber"
 * field are decorative to match the reference.
 */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="tara">
      <div class="tara__topbar">
        <span>Turvaline autentimine asutuste e-teenustes</span>
        <div class="tara__toplinks">
          <a href="#" (click)="$event.preventDefault()">LIGIPÄÄSETAVUS</a>
          <span class="tara__sep">|</span>
          <a href="#" (click)="$event.preventDefault()">ENGLISH</a>
          <a href="#" (click)="$event.preventDefault()">РУССКИЙ</a>
        </div>
      </div>

      <div class="tara__brandband">
        <svg class="tara__coa" width="40" height="48" viewBox="0 0 40 48" aria-hidden="true">
          <path
            d="M2 4 L20 2 L38 4 L38 24 C38 36 28 44 20 46 C12 44 2 36 2 24 Z"
            fill="#0a3a68"
            stroke="#b8973e"
            stroke-width="2"
          />
          <text x="20" y="27" text-anchor="middle" font-size="11" font-weight="700" fill="#e8c873">
            EST
          </text>
        </svg>
        <span class="tara__brandtitle">Riigi autentimisteenus</span>
      </div>

      <div class="tara__content">
        <div class="tara__tabs" role="tablist">
          <div class="tara__tab" role="tab">ID-kaart</div>
          <div class="tara__tab tara__tab--active" role="tab" aria-selected="true">Mobiil-ID</div>
          <div class="tara__tab" role="tab">Smart-ID</div>
          <div class="tara__tab" role="tab">EU eID</div>
        </div>

        <div class="tara__card">
          <div class="tara__inner">
          <h2>Mobiil-ID</h2>
          <p>
            Teenusesse <strong>Riigi autentimisteenuse iseteenindus</strong> sisselogimiseks on vaja
            kehtivat Mobiil-ID lepingut. Sisestage oma isikukood ja telefoninumber ning vajutage
            "Jätka". Seejärel saadetakse Teie mobiiltelefonile kontrollsõnum.
          </p>

          <div class="tara__form">
            <label for="tara-isikukood">Isikukood</label>
            <div class="tara__inputwrap">
              <span class="tara__prefix">EE</span>
              <input id="tara-isikukood" [formControl]="code" />
            </div>

            <label for="tara-phone">Telefoninumber</label>
            <div class="tara__inputwrap">
              <span class="tara__prefix">+372</span>
              <input id="tara-phone" value="5555 1234" />
            </div>

            <span></span>
            <button type="button" class="tara__submit" (click)="submit()">Jätka</button>
          </div>
          </div>
        </div>

        <div class="tara__demo">
          <span class="tara__demo-note">Näidiskeskkond — päris TARA-t ei kasutata. Logi sisse testkasutajana:</span>
          @for (p of demoPeople; track p.code) {
            <button type="button" class="tara__demo-link" (click)="pick(p.code)">{{ p.label }} →</button>
          }
        </div>

        <div class="tara__links">
          <a href="#" (click)="$event.preventDefault()">Tagasi teenusepakkuja juurde</a>
          <a href="#" (click)="$event.preventDefault()">Abi id.ee lehelt</a>
        </div>
      </div>

      <div class="tara__footer">
        <div class="tara__eu">
          <svg width="46" height="32" viewBox="0 0 46 32" aria-hidden="true">
            <rect width="46" height="32" fill="#003399" />
            <circle cx="23" cy="16" r="10" fill="none" stroke="#ffcc00" stroke-width="1" stroke-dasharray="2 3" />
          </svg>
          <span class="tara__eu-text">Euroopa Liit<br />Euroopa Regionaalarengu Fond</span>
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" fill="#fff" stroke="#999" />
            <text x="16" y="20" text-anchor="middle" font-size="9" fill="#003168">EST</text>
          </svg>
          <span class="tara__eu-text">Eesti tuleviku heaks</span>
        </div>
        <a href="#" (click)="$event.preventDefault()">Riigi autentimisteenusest lähemalt</a>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .tara {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        font-family: Arial, Helvetica, sans-serif;
        color: #1a1a1a;
      }

      .tara__topbar {
        background: #003168;
        color: #fff;
        font-size: 14px;
        padding: 12px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .tara__toplinks a {
        color: #fff;
        text-decoration: none;
        font-weight: 600;
        letter-spacing: 0.02em;
        margin-left: 12px;
      }
      .tara__toplinks a:hover {
        text-decoration: underline;
      }
      .tara__sep {
        opacity: 0.5;
        margin: 0 12px;
      }

      .tara__brandband {
        background: #fff;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .tara__brandtitle {
        font-variant: small-caps;
        letter-spacing: 0.06em;
        font-size: 20px;
        font-weight: 600;
        color: #333;
      }

      .tara__content {
        flex: 1;
        background: #f0f2f5;
        padding: 32px 24px;
      }
      .tara__tabs,
      .tara__card,
      .tara__demo,
      .tara__links {
        max-width: 1030px;
        margin-left: auto;
        margin-right: auto;
      }

      .tara__tabs {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
      }
      .tara__tab {
        flex: none;
        width: 192px;
        box-sizing: border-box;
        background: #fff;
        text-align: center;
        padding: 16px;
        border-radius: 8px;
        font-weight: 600;
        color: #003168;
      }
      .tara__tab--active {
        background: #015a96;
        color: #fff;
      }

      .tara__card {
        background: #fff;
        border-radius: 12px;
        padding: 48px 48px 56px;
      }
      .tara__inner {
        max-width: 760px;
        margin: 0 auto;
      }
      .tara__card h2 {
        margin: 0 0 16px;
        font-size: 28px;
        color: #003168;
      }
      .tara__card p {
        margin: 0 0 32px;
        line-height: 1.5;
        max-width: 720px;
      }

      .tara__form {
        display: grid;
        grid-template-columns: 140px 1fr;
        column-gap: 16px;
        row-gap: 20px;
        align-items: center;
        max-width: 520px;
      }
      .tara__form label {
        text-align: right;
        font-weight: 600;
        color: #003168;
      }
      .tara__inputwrap {
        display: flex;
        border: 1px solid #c7cdd6;
        border-radius: 6px;
        overflow: hidden;
      }
      .tara__prefix {
        background: #eef0f3;
        padding: 12px 14px;
        color: #666;
        border-right: 1px solid #c7cdd6;
      }
      .tara__inputwrap input {
        border: none;
        outline: none;
        padding: 12px 14px;
        flex: 1;
        font-size: 16px;
        min-width: 0;
      }

      .tara__submit {
        justify-self: start;
        background: #1d7d33;
        color: #fff;
        border: none;
        border-radius: 6px;
        height: 48px;
        width: 120px;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
      }
      .tara__submit:hover {
        background: #176228;
      }

      .tara__demo {
        margin-top: 24px;
        background: #eaf2fb;
        border: 1px solid #b9d2ec;
        border-radius: 12px;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px 16px;
      }
      .tara__demo-note {
        color: #24405e;
        font-size: 14px;
      }
      .tara__demo-link {
        background: #015a96;
        border: none;
        color: #fff;
        border-radius: 999px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 700;
        padding: 10px 20px;
      }
      .tara__demo-link:hover {
        background: #003168;
      }

      .tara__links {
        display: flex;
        justify-content: space-between;
        margin-top: 16px;
      }
      .tara__links a {
        color: #015a96;
        text-decoration: none;
      }
      .tara__links a:hover {
        text-decoration: underline;
      }

      .tara__footer {
        background: #d8dce3;
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }
      .tara__footer a {
        color: #015a96;
        text-decoration: none;
      }
      .tara__footer a:hover {
        text-decoration: underline;
      }
      .tara__eu {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .tara__eu-text {
        font-size: 10px;
        color: #444;
        line-height: 1.2;
      }
    `,
  ],
})
export class Login {
  private readonly identity = inject(IdentityService);
  private readonly router = inject(Router);

  protected readonly demoPeople = DEMO_PEOPLE;
  protected readonly code = new FormControl('48505150220', { nonNullable: true });

  protected pick(code: string): void {
    this.code.setValue(code);
    this.submit();
  }

  protected submit(): void {
    if (this.code.value.length !== 11) {
      return;
    }
    const name = DEMO_PEOPLE.find((p) => p.code === this.code.value)?.name ?? '';
    this.identity.login(this.code.value, name);
    this.router.navigate(['/select-role']);
  }
}
