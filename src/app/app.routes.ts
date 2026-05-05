import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { moduleGuard } from './core/guards/module.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { path: 'home', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'stock',
    loadChildren: () => import('./features/stock/stock.routes').then(m => m.stockRoutes),
    canActivate: [AuthGuard, moduleGuard('stock')]
  },
  {
    path: 'articles',
    redirectTo: '/stock/articles',
    pathMatch: 'full'
  },
  {
    path: 'commandes',
    loadChildren: () => import('./features/commandes/commandes.routes').then(m => m.commandesRoutes),
    canActivate: [AuthGuard, moduleGuard('commandes')]
  },
  {
    path: 'clients-fournisseurs',
    loadChildren: () => import('./features/clients-fournisseurs/clients-fournisseurs.routes').then(m => m.clientsFournisseursRoutes),
    canActivate: [AuthGuard, moduleGuard('clients')]
  },
  {
    path: 'taches',
    loadChildren: () => import('./features/taches/taches.routes').then(m => m.tachesRoutes),
    canActivate: [AuthGuard, moduleGuard('taches')]
  },
  {
    path: 'achats',
    loadChildren: () => import('./features/achats/achats.routes').then(m => m.achatsRoutes),
    canActivate: [AuthGuard, moduleGuard('achats')]
  },
  {
    path: 'importations',
    loadChildren: () => import('./features/importations/importations.routes').then(m => m.importationsRoutes),
    canActivate: [AuthGuard, moduleGuard('importations')]
  },
  {
    path: 'mouvements',
    loadChildren: () => import('./features/mouvements/mouvements.routes').then(m => m.mouvementsRoutes),
    canActivate: [AuthGuard, moduleGuard('mouvements')]
  },
  {
    path: 'utilisateurs',
    loadChildren: () => import('./features/utilisateurs/utilisateurs.routes').then(m => m.utilisateursRoutes),
    canActivate: [AuthGuard, moduleGuard('utilisateurs')]
  },
  {
    path: 'rapports',
    loadChildren: () => import('./features/rapports/rapports.routes').then(m => m.rapportsRoutes),
    canActivate: [AuthGuard, moduleGuard('rapports')]
  },
  {
    path: 'chatbot',
    loadComponent: () => import('./features/chatbot/chatbot.component').then(m => m.ChatbotComponent),
    canActivate: [AuthGuard, moduleGuard('chatbot')]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [AuthGuard, moduleGuard('admin')]
  },
  { path: '**', redirectTo: '/dashboard' }
];


