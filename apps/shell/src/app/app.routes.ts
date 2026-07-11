import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { Login } from './identity/login';
import { RoleSelect } from './identity/role-select';
import { ServiceApplication } from './services/service-application';
import { PreAdvisory } from './services/pre-advisory';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Login },
  { path: 'vali-roll', component: RoleSelect },
  {
    path: 'profiil',
    loadComponent: () =>
      loadRemoteModule({
        type: 'manifest',
        remoteName: 'profileMfe',
        exposedModule: './Component',
      }).then((m) => m.App),
  },
  { path: 'teenus', component: ServiceApplication },
  { path: 'programm', component: PreAdvisory },
];
