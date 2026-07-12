import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DdsButton, DdsInput } from '@dds/ui';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IdentityService } from './identity.service';

const DEMO_PEOPLE = [
  { code: '37510090251', name: 'Priit Mikelsaar', label: 'Priit Mikelsaar — Biomarket OÜ omanik' },
];

/** Mock dev login (Scenario prerequisite). No real TARA/RIA — enter or pick an ID code. */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DdsButton, DdsInput],
  template: `
    <div class="login">
      <span class="login__eyebrow">Iseteenindus · testkeskkond</span>
      <h1>Logi sisse</h1>
      <p>
        See on näidiskeskkonna sisselogimine — päris TARA/RIA autentimist ei kasutata.
        Sisesta isikukood või vali näidiskasutaja.
      </p>

      <div class="login__field">
        <dds-input label="Isikukood" placeholder="nt 37510090251" [formControl]="code" />
      </div>

      <div class="login__demos">
        @for (p of demoPeople; track p.code) {
          <button type="button" dds-button variant="secondary" size="sm" (click)="pick(p.code)">
            {{ p.label }}
          </button>
        }
      </div>

      <button dds-button variant="primary" [disabled]="code.value.length !== 11" (click)="submit()">
        Logi sisse
      </button>
    </div>
  `,
  styles: [
    `
      .login {
        max-width: var(--dds-width-form);
        margin: 0 auto;
        padding: var(--dds-space-7) var(--dds-space-6);
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-4);
        align-items: flex-start;
      }
      .login__eyebrow {
        font-size: var(--dds-font-size-xs);
        font-weight: var(--dds-font-weight-bold);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--dds-color-primary);
      }
      h1 {
        margin: 0;
        font-size: var(--dds-font-size-xl);
        font-weight: var(--dds-font-weight-bold);
      }
      p {
        margin: 0;
        color: var(--dds-color-ink-muted);
      }
      .login__field {
        width: 100%;
        max-width: 320px;
      }
      .login__demos {
        display: flex;
        flex-wrap: wrap;
        gap: var(--dds-space-2);
      }
    `,
  ],
})
export class Login {
  private readonly identity = inject(IdentityService);
  private readonly router = inject(Router);

  protected readonly demoPeople = DEMO_PEOPLE;
  protected readonly code = new FormControl('', { nonNullable: true });

  protected pick(code: string): void {
    this.code.setValue(code);
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
