import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./shared/layout/tabs.routes').then((m) => m.tabsRoutes),
  },
];
