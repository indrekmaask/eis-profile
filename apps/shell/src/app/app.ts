import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { IdentityService } from './identity/identity.service';

interface NavItem {
  label: string;
  link?: string;
  params?: Record<string, string>;
}
interface NavGroup {
  label: string;
  icon: string;
  expanded?: boolean;
  items?: NavItem[];
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly identity = inject(IdentityService);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly isLogin = computed(() => {
    const u = this.url();
    return u === '/' || u.startsWith('/?');
  });
  protected readonly showChrome = computed(() => !this.isLogin());
  protected readonly showSidebar = computed(() => this.showChrome() && !!this.identity.activeCompany());

  protected readonly profileParams = computed(() => ({
    rc: this.identity.activeCompany()?.registryCode ?? '',
    person: this.identity.personCode(),
  }));

  protected readonly userMenuOpen = signal(false);

  protected readonly navGroups: NavGroup[] = [
    {
      label: 'Peamine',
      icon: 'home',
      expanded: true,
      items: [
        { label: 'Töölaud', link: '/dashboard' },
        { label: 'Ettevõtte profiil', link: '/profile' },
        { label: 'Taotlused' },
        { label: 'Minu teenused', link: '/services' },
        { label: 'Arenguplaan' },
        { label: 'Küpsusdiagnostika' },
      ],
    },
    { label: 'Finantsid', icon: 'wallet' },
    { label: 'Eksport', icon: 'globe' },
    { label: 'Aruandlus', icon: 'chart' },
    { label: 'Haldus', icon: 'settings' },
  ];

  protected logout(): void {
    this.userMenuOpen.set(false);
    this.identity.logout();
    this.router.navigate(['/']);
  }
}
