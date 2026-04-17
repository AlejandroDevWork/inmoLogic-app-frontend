import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';

export const tabsRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../../features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'agencies',
        loadComponent: () => import('../../features/agencies/agencies.page').then((m) => m.AgenciesPage),
      },
      {
        path: 'visitas',
        loadComponent: () => import('../../features/visitas/visitas.page').then((m) => m.VisitasPage),
      },
      {
        path: 'contacts',
        loadComponent: () => import('../../features/contacts/contacts.page').then((m) => m.ContactsPage),
      },
      {
        path: 'properties',
        loadComponent: () => import('../../features/properties/properties.page').then((m) => m.PropertiesPage),
      },
      {
        path: 'properties/:id',
        loadComponent: () => import('../../features/properties/property-detail.page').then((m) => m.PropertyDetailPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];