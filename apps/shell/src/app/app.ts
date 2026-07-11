import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { IdentityService } from './identity/identity.service';

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

  protected logout(): void {
    this.identity.logout();
    this.router.navigate(['/']);
  }
}
