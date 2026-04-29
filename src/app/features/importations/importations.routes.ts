import { Routes } from '@angular/router';

export const importationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./importations.component').then(m => m.ImportationsComponent)
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./importation-form.component').then(m => m.ImportationFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./importation-form.component').then(m => m.ImportationFormComponent)
  },
  {
    path: ':id/details',
    loadComponent: () => import('./importation-details.component').then(m => m.ImportationDetailsComponent)
  }
];


