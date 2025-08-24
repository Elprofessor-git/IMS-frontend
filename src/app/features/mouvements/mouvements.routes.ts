import { Routes } from '@angular/router';

export const mouvementsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./mouvements.component').then(m => m.MouvementsComponent)
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./mouvement-form.component').then(m => m.MouvementFormComponent)
  },
  {
    path: ':id/details',
    loadComponent: () => import('./mouvement-details.component').then(m => m.MouvementDetailsComponent)
  }
];
