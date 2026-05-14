import { Routes } from '@angular/router';

export const commandesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./commandes.component').then(m => m.CommandesComponent)
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./commande-form.component').then(m => m.CommandeFormComponent)
  },
  {
    path: 'modeles-bom',
    loadComponent: () => import('./modele-bom.component').then(m => m.ModeleBomComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./commande-form.component').then(m => m.CommandeFormComponent)
  },
  {
    path: ':id/details',
    loadComponent: () => import('./commande-details.component').then(m => m.CommandeDetailsComponent)
  }
];


