import { Routes } from '@angular/router';

export const clientsFournisseursRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./clients-fournisseurs.component').then(m => m.ClientsFournisseursComponent)
  },
  {
    path: 'clients/nouveau',
    loadComponent: () => import('./clients/client-form.component').then(m => m.ClientFormComponent)
  },
  {
    path: 'clients/:id',
    loadComponent: () => import('./clients/client-form.component').then(m => m.ClientFormComponent)
  },
  {
    path: 'fournisseurs/nouveau',
    loadComponent: () => import('./fournisseurs/fournisseur-form.component').then(m => m.FournisseurFormComponent)
  },
  {
    path: 'fournisseurs/:id',
    loadComponent: () => import('./fournisseurs/fournisseur-form.component').then(m => m.FournisseurFormComponent)
  }
];


