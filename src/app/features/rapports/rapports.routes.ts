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
    path: 'ventes',
    loadComponent: () => import('./rapport-ventes.component').then(m => m.RapportVentesComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./analytics.component').then(m => m.AnalyticsComponent)
  }
];