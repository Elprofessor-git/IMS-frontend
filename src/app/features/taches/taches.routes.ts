import { Routes } from '@angular/router';

export const tachesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./taches.component').then(m => m.TachesComponent)
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./tache-form.component').then(m => m.TacheFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./tache-form.component').then(m => m.TacheFormComponent)
  },
  {
    path: ':id/details',
    loadComponent: () => import('./tache-details.component').then(m => m.TacheDetailsComponent)
  }
];
