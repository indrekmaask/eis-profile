import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DdsButton, DdsStepper, DdsStep } from '@dds/ui';

interface StepDef {
  label: string;
  subtitle: string;
  questions: string[];
}

const OPTIONS = ['Süsteemne ja toimiv', 'Olemas, aga ebaühtlane', 'Osaliselt / käsitsi', 'Puudub'];

const STEPS: StepDef[] = [
  {
    label: 'Ärimudel ja juhtimine',
    subtitle: 'Kuidas ettevõtte strateegia ja juhtimine on korraldatud',
    questions: [
      'Kas ettevõttel on selge ja dokumenteeritud strateegia?',
      'Kas juhtimisotsused tuginevad andmetele?',
      'Kas vastutused ja rollid on selgelt jaotatud?',
    ],
  },
  {
    label: 'Protsessid',
    subtitle: 'Kuidas teie ettevõtte igapäevatöö on korraldatud — müük, teenindus, arveldus',
    questions: [
      'Kas teie peamised äriprotsessid (nt müük, teenindus, arveldus) on kaardistatud?',
      'Kui suur osa protsessidest on automatiseeritud (mitte käsitsi Excelis või e-kirjas)?',
      'Kas protsessid toimivad ühtselt või sõltuvad inimestest (”tean ise peas”)?',
    ],
  },
  {
    label: 'Tehnoloogia ja andmed',
    subtitle: 'Kuidas tehnoloogia ja andmed toetavad igapäevast tööd',
    questions: [
      'Kas kasutate keskseid süsteeme andmete haldamiseks?',
      'Kas andmed on ühes kohas ja usaldusväärsed?',
      'Kas süsteemid on omavahel integreeritud?',
    ],
  },
  {
    label: 'Klienditeekond ja müük',
    subtitle: 'Kuidas kliente leitakse, teenindatakse ja hoitakse',
    questions: [
      'Kas kliendisuhtlus on süsteemne ja jälgitav?',
      'Kas müügiprotsess on korduvkasutatav ja mõõdetav?',
      'Kas kogute ja kasutate kliendi tagasisidet?',
    ],
  },
  {
    label: 'Inimesed ja oskused',
    subtitle: 'Kuidas meeskonna oskused ja arendus on korraldatud',
    questions: [
      'Kas meeskonna oskused vastavad ettevõtte vajadustele?',
      'Kas arendate töötajaid süsteemselt?',
      'Kas teadmised on jagatud, mitte üksikute inimeste peas?',
    ],
  },
];

/** Prototype-only maturity questionnaire (Figma "Digiküpsuse hindamine"). Static/interactive. */
@Component({
  selector: 'app-kupsus-hindamine',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DdsButton, DdsStepper],
  template: `
    <div class="q">
      <nav class="q__crumb">Peamine / Küpsusdiagnostika / Digiküpsuse hindamine</nav>
      <h1>Digiküpsuse hindamine</h1>
      <p class="q__lead">
        Hinda oma ettevõtte digiküpsust, et mõista, kui tõhusalt toetavad tehnoloogiad ja andmed
        sinu igapäevast äritegevust. Hindamine aitab tuvastada kitsaskohad protsessides, süsteemides
        ja oskustes ning annab suuna, kuidas liikuda parema automatiseerituse poole.
      </p>

      <dds-stepper [steps]="steps()" [active]="active()" (select)="active.set($event)" />

      <section class="card">
        <h2>{{ current().label }}</h2>
        <p class="q__sub">{{ current().subtitle }}</p>

        @for (question of current().questions; track $index; let qi = $index) {
          <div class="q__block">
            <span class="q__tag">Küsimus {{ qi + 1 }}/{{ current().questions.length }}</span>
            <p class="q__text">{{ question }}</p>
            <div class="q__options">
              @for (opt of options; track opt; let oi = $index) {
                <label class="q__opt" [class.is-sel]="answer(qi) === oi">
                  <input
                    type="radio"
                    [name]="'q' + active() + '-' + qi"
                    [checked]="answer(qi) === oi"
                    (change)="setAnswer(qi, oi)"
                  />
                  <span>{{ opt }}</span>
                </label>
              }
            </div>
          </div>
        }

        <div class="q__nav">
          <button dds-button variant="secondary" size="sm" [disabled]="active() === 0" (click)="back()">
            ‹ Tagasi
          </button>
          <button dds-button variant="primary" size="sm" (click)="next()">
            {{ isLast() ? 'Vaata tulemust' : 'Edasi' }} →
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .q {
        max-width: 820px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--dds-space-4);
      }
      .q__crumb {
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      h1 {
        margin: 0;
        font-size: var(--dds-font-size-2xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .q__lead {
        margin: 0;
        color: var(--dds-color-ink-muted);
      }
      .card {
        background: var(--dds-color-surface);
        border-radius: var(--dds-radius-card);
        box-shadow: var(--dds-shadow-card);
        padding: var(--dds-space-6);
      }
      .card h2 {
        margin: 0;
        font-size: var(--dds-font-size-xl);
        font-weight: var(--dds-font-weight-bold);
      }
      .q__sub {
        margin: var(--dds-space-1) 0 var(--dds-space-5);
        color: var(--dds-color-ink-muted);
        font-size: var(--dds-font-size-sm);
      }
      .q__block {
        margin-bottom: var(--dds-space-5);
      }
      .q__tag {
        display: inline-block;
        background: var(--dds-color-registry-highlight);
        color: var(--dds-color-registry-accent);
        font-size: var(--dds-font-size-xs);
        font-weight: var(--dds-font-weight-medium);
        padding: 2px var(--dds-space-2);
        border-radius: var(--dds-radius-pill);
      }
      .q__text {
        margin: var(--dds-space-2) 0 var(--dds-space-3);
        font-weight: var(--dds-font-weight-medium);
      }
      .q__options {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--dds-space-2);
      }
      .q__opt {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--dds-space-2);
        text-align: center;
        border: 1px solid var(--dds-color-border);
        border-radius: var(--dds-radius-control);
        padding: var(--dds-space-3);
        cursor: pointer;
        font-size: var(--dds-font-size-sm);
      }
      .q__opt.is-sel {
        border-color: var(--dds-color-primary);
        background: color-mix(in srgb, var(--dds-color-primary) 6%, transparent);
      }
      .q__opt input {
        accent-color: var(--dds-color-primary);
      }
      .q__nav {
        display: flex;
        justify-content: space-between;
        border-top: 1px solid var(--dds-color-border);
        padding-top: var(--dds-space-4);
      }
      @media (max-width: 720px) {
        .q__options {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
})
export class KupsusHindamine {
  private readonly router = inject(Router);

  protected readonly options = OPTIONS;
  protected readonly active = signal(1);
  private readonly answers = signal<Record<string, number>>({});

  protected readonly steps = computed<DdsStep[]>(() => STEPS.map((s) => ({ label: s.label })));
  protected readonly current = computed(() => STEPS[this.active()]);
  protected readonly isLast = computed(() => this.active() === STEPS.length - 1);

  protected answer(qi: number): number | undefined {
    return this.answers()[`${this.active()}-${qi}`];
  }

  protected setAnswer(qi: number, oi: number): void {
    this.answers.update((a) => ({ ...a, [`${this.active()}-${qi}`]: oi }));
  }

  protected back(): void {
    this.active.update((a) => Math.max(0, a - 1));
  }

  protected next(): void {
    if (this.isLast()) {
      this.router.navigate(['/maturity/result']);
      return;
    }
    this.active.update((a) => Math.min(STEPS.length - 1, a + 1));
  }
}
