import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'parametres',
    pathMatch: 'full'
  },
  {
    path: 'parametres',
    loadComponent: () => import('./parametres.component').then(m => m.ParametresComponent)
  }
]; 