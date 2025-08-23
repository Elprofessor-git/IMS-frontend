import { Routes } from '@angular/router';
import { MockAuthGuard } from './core/guards/mock-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [MockAuthGuard]
  },
  {
    path: 'stock',
    loadChildren: () => import('./features/stock/stock.routes').then(m => m.stockRoutes),
    canActivate: [MockAuthGuard]
  },
  {
    path: 'commandes',
    loadChildren: () => import('./features/commandes/commandes.routes').then(m => m.commandesRoutes),
    canActivate: [MockAuthGuard]
  },
  {
    path: 'clients-fournisseurs',
    loadChildren: () => import('./features/clients-fournisseurs/clients-fournisseurs.routes').then(m => m.clientsFournisseursRoutes),
    canActivate: [MockAuthGuard]
  },
  {
    path: 'taches',
    loadChildren: () => import('./features/taches/taches.routes').then(m => m.tachesRoutes),
    canActivate: [MockAuthGuard]
  },
  {
    path: 'achats',
    loadChildren: () => import('./features/achats/achats.routes').then(m => m.achatsRoutes),
    canActivate: [MockAuthGuard]
  },
  {
    path: 'importations',
    loadChildren: () => import('./features/importations/importations.routes').then(m => m.importationsRoutes),
    canActivate: [MockAuthGuard]
  },
  {
    path: 'mouvements',
    loadChildren: () => import('./features/mouvements/mouvements.routes').then(m => m.mouvementsRoutes),
    canActivate: [MockAuthGuard]
  },
  {
    path: 'utilisateurs',
    loadChildren: () => import('./features/utilisateurs/utilisateurs.routes').then(m => m.utilisateursRoutes),
    canActivate: [MockAuthGuard]
  },
  {
    path: 'rapports',
    loadChildren: () => import('./features/rapports/rapports.routes').then(m => m.rapportsRoutes),
    canActivate: [MockAuthGuard]
  },
  {
    path: 'chatbot',
    loadComponent: () => import('./features/chatbot/chatbot.component').then(m => m.ChatbotComponent),
    canActivate: [MockAuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [MockAuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
