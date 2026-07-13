import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DdsButton, DdsCard } from '@dds/ui';
import { ProfileApiService, ProfileView, derivePersonInfo } from '@eis/profile-api';
import { IdentityService } from '../identity/identity.service';
import { exportRevenue, money } from './services.data';

const MARKET_LABELS: Record<string, string> = {
  EE: 'Eesti', FI: 'Soome', SE: 'Rootsi', LV: 'Läti', LT: 'Leedu', NO: 'Norra',
  DK: 'Taani', DE: 'Saksamaa', PL: 'Poola', NL: 'Holland', FR: 'Prantsusmaa',
  GB: 'Ühendkuningriik', US: 'Ameerika Ühendriigid',
};

const TAIE_OPTIONS = [
  'Digilahendused',
  'Tervisetehnoloogiad ja -teenused',
  'Kohalike ressursside väärindamine',
  'Nutikad ja kestlikud energialahendused',
];

const CONTENT_QUESTIONS = [
  'Millises tegevusvaldkonnas ettevõte täna tegutseb ja millise tegevusvaldkonna alla planeeritakse arenguprogrammis tehtav muutus? *',
  'Milline on ettevõtte omanike ambitsioon ja nägemus ettevõtte arengust järgneva 3–5 aasta jooksul? Palun kirjelda ambitsiooni/eesmärki sisuliselt ja numbriliselt. *',
  'Milline on arenguprogrammi abil planeeritava strateegilise muudatuse või arenduse idee? Milliseid tegevusi on plaanis ellu viia ja milline on planeeritav investeeringu suurus? *',
];

/**
 * Arenguprogrammi eelnõustamine — own subpage (v22 flows): profile-prefilled
 * registration form with a contact picker; birth date derived from the ID code.
 */
@Component({
  selector: 'app-pre-advisory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DdsButton, DdsCard],
  templateUrl: './pre-advisory.html',
  styleUrl: './pre-advisory.scss',
})
export class PreAdvisory {
  protected readonly identity = inject(IdentityService);
  private readonly api = inject(ProfileApiService);
  private readonly router = inject(Router);

  protected readonly taieOptions = TAIE_OPTIONS;
  protected readonly questions = CONTENT_QUESTIONS;

  protected readonly profile = signal<ProfileView | null>(null);
  protected readonly done = signal(false);
  protected readonly submitAttempted = signal(false);

  /** Selected person: a contact id, or 'new' for "Keegi teine". */
  protected readonly selectedKey = signal<string>('');

  protected readonly website = new FormControl('', { nonNullable: true });
  protected readonly newName = new FormControl('', { nonNullable: true });
  protected readonly email = new FormControl('', { nonNullable: true });
  protected readonly phone = new FormControl('', { nonNullable: true });
  protected readonly taie = new FormControl('', { nonNullable: true });
  protected readonly answers = [
    new FormControl('', { nonNullable: true }),
    new FormControl('', { nonNullable: true }),
    new FormControl('', { nonNullable: true }),
  ];

  protected readonly markets = signal<string[]>([]);

  protected readonly selectedContact = computed(() => {
    const p = this.profile();
    if (!p || this.selectedKey() === 'new') {
      return null;
    }
    return p.contacts.find((c) => c.id === this.selectedKey()) ?? null;
  });

  protected readonly birthDate = computed(() => {
    const info = derivePersonInfo(this.selectedContact()?.personCode);
    return info ? info.birthDateDisplay.replace(/(^|\.)0/g, '$1') : null;
  });

  protected readonly exportLabel = computed(() => {
    const r = this.profile()?.annualReports[0];
    return r ? money(exportRevenue(r)) : '—';
  });

  protected readonly marketOptions = computed(() =>
    Object.entries(MARKET_LABELS).filter(([code]) => !this.markets().includes(code)),
  );

  constructor() {
    const company = this.identity.activeCompany();
    if (company) {
      this.api.getProfile(company.registryCode).subscribe((p) => {
        this.profile.set(p);
        this.website.setValue(p.website.value ?? '');
        this.markets.set([...p.cards.targetMarkets]);
        const primary = p.contacts.find((c) => c.primary) ?? p.contacts[0];
        if (primary) {
          this.pick(primary.id);
        } else {
          this.pick('new');
        }
      });
    }
  }

  protected pick(key: string): void {
    this.selectedKey.set(key);
    const c = this.selectedContact();
    this.email.setValue(c?.email ?? '');
    this.phone.setValue(c?.phone ?? '');
    if (key === 'new') {
      this.newName.setValue('');
    }
  }

  protected marketLabel(code: string): string {
    return MARKET_LABELS[code] ?? code;
  }
  protected removeMarket(code: string): void {
    this.markets.update((m) => m.filter((c) => c !== code));
  }
  protected addMarket(code: string): void {
    if (code) {
      this.markets.update((m) => (m.includes(code) ? m : [...m, code]));
    }
  }

  protected invalid(control: FormControl<string>): boolean {
    return this.submitAttempted() && !control.value.trim();
  }

  protected submit(): void {
    this.submitAttempted.set(true);
    const nameOk = this.selectedKey() !== 'new' || this.newName.value.trim();
    const answersOk = this.answers.every((a) => a.value.trim());
    if (!nameOk || !this.email.value.trim() || !this.phone.value.trim() || !answersOk || !this.taie.value) {
      return;
    }
    this.done.set(true);
    window.scrollTo(0, 0);
  }

  protected toDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  protected toRoles(): void {
    this.router.navigate(['/select-role']);
  }
}
