import { Routes } from '@angular/router';

export const achatsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./achats.component').then(m => m.AchatsComponent)
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./achat-form.component').then(m => m.AchatFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./achat-form.component').then(m => m.AchatFormComponent)
  },
  {
    path: ':id/details',
    loadComponent: () => import('./achat-details.component').then(m => m.AchatDetailsComponent)
  }
];
