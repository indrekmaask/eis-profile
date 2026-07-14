import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { Login } from './identity/login';
import { RoleSelect } from './identity/role-select';
import { ServiceApplication } from './services/service-application';
import { PreAdvisory } from './services/pre-advisory';
import { ServicesList } from './services/services-list';
import { ServiceDetail } from './services/service-detail';
import { Toolaud } from './dashboard/toolaud';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Login },
  { path: 'select-role', component: RoleSelect },
  { path: 'dashboard', component: Toolaud },
  {
    path: 'profile',
    loadComponent: () =>
      loadRemoteModule({
        type: 'manifest',
        remoteName: 'profileMfe',
        exposedModule: './Component',
      }).then((m) => m.App),
  },
  { path: 'services', component: ServicesList },
  { path: 'services/:id', component: ServiceDetail },
  { path: 'service', component: ServiceApplication },
  { path: 'programme', component: PreAdvisory },
];
