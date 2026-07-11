import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';

export const routes: Routes = [
  {
    path: 'profiil',
    loadComponent: () =>
      loadRemoteModule({
        type: 'manifest',
        remoteName: 'profileMfe',
        exposedModule: './Component',
      }).then((m) => m.App),
  },
  { path: '', pathMatch: 'full', redirectTo: 'profiil' },
];
