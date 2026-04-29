import { Routes } from '@angular/router';

export const utilisateursRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./utilisateurs.component').then(m => m.UtilisateursComponent)
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./utilisateur-form.component').then(m => m.UtilisateurFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./utilisateur-form.component').then(m => m.UtilisateurFormComponent)
  },
  {
    path: 'roles',
    loadComponent: () => import('./roles.component').then(m => m.RolesComponent)
  },
  {
    path: 'roles/nouveau',
    loadComponent: () => import('./role-form.component').then(m => m.RoleFormComponent)
  },
  {
    path: 'roles/:id',
    loadComponent: () => import('./role-form.component').then(m => m.RoleFormComponent)
  }
];


