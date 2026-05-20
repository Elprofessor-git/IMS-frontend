import { Routes } from '@angular/router';

export const rapportsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'stock',
    pathMatch: 'full'
  },
  {
    path: 'stock',
    loadComponent: () => import('./rapport-stock.component').then(m => m.RapportStockComponent)
  },
  {
    path: 'achats',
    loadComponent: () => import('./rapport-achats.component').then(m => m.RapportAchatsComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./analytics.component').then(m => m.AnalyticsComponent)
  }
];

