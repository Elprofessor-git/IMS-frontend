import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  permission?: { module: string; action: string };
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule
  ],
  template: `
    <div class="sidebar-content">
      <div class="logo">
        <h3>Gestion Textile</h3>
      </div>
      
      <mat-nav-list>
        <ng-container *ngFor="let item of menuItems">
          <!-- Menu simple -->
          <a 
            *ngIf="!item.children && hasPermission(item)"
            mat-list-item 
            [routerLink]="item.route"
            routerLinkActive="active">
            <mat-icon matListIcon>{{ item.icon }}</mat-icon>
            <span matLine>{{ item.label }}</span>
          </a>
          
          <!-- Menu avec sous-menus -->
          <mat-expansion-panel 
            *ngIf="item.children && hasPermission(item)"
            class="menu-expansion">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon class="menu-icon">{{ item.icon }}</mat-icon>
                {{ item.label }}
              </mat-panel-title>
            </mat-expansion-panel-header>
            
            <mat-nav-list class="submenu">
              <a 
                *ngFor="let child of item.children"
                mat-list-item 
                [routerLink]="child.route"
                routerLinkActive="active"
                class="submenu-item">
                <mat-icon matListIcon>{{ child.icon }}</mat-icon>
                <span matLine>{{ child.label }}</span>
              </a>
            </mat-nav-list>
          </mat-expansion-panel>
        </ng-container>
      </mat-nav-list>
    </div>
  `,
  styles: [`
    .sidebar-content {
      height: 100%;
      background-color: #f5f5f5;
    }
    
    .logo {
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #ddd;
    }
    
    .logo h3 {
      margin: 0;
      color: #1976d2;
      font-weight: 500;
    }
    
    .mat-mdc-nav-list {
      padding-top: 0;
    }
    
    .mat-mdc-list-item {
      min-height: 48px;
    }
    
    .mat-mdc-list-item.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .mat-mdc-list-item.active .mat-icon {
      color: #1976d2;
    }
    
    .menu-expansion {
      box-shadow: none;
      border-radius: 0;
    }
    
    .menu-expansion .mat-expansion-panel-header {
      padding: 0 16px;
      min-height: 48px;
    }
    
    .menu-icon {
      margin-right: 16px;
    }
    
    .submenu {
      background-color: #eeeeee;
    }
    
    .submenu-item {
      padding-left: 32px;
      min-height: 40px;
    }
    
    @media (max-width: 768px) {
      .logo h3 {
        font-size: 1rem;
      }
    }
  `]
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    {
      label: 'Tableau de Bord',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Gestion de Stock',
      icon: 'inventory',
      children: [
        { label: 'Stock', icon: 'storage', route: '/stock' },
        { label: 'Articles', icon: 'category', route: '/stock/articles' },
        { label: 'Mouvements de Stock', icon: 'swap_horiz', route: '/mouvements' }
      ],
      permission: { module: 'Stock', action: 'Read' }
    },
    {
      label: 'Commandes & Production',
      icon: 'shopping_cart',
      children: [
        { label: 'Commandes Clients', icon: 'receipt', route: '/commandes' },
        { label: 'Tâches de Production', icon: 'task', route: '/taches' }
      ],
      permission: { module: 'Commandes', action: 'Read' }
    },
    {
      label: 'Achats & Importations',
      icon: 'local_shipping',
      children: [
        { label: 'Achats Fournisseurs', icon: 'shopping_bag', route: '/achats' },
        { label: 'Importations', icon: 'flight_land', route: '/importations' }
      ],
      permission: { module: 'Achats', action: 'Read' }
    },
    {
      label: 'Partenaires',
      icon: 'people',
      children: [
        { label: 'Clients & Fournisseurs', icon: 'business', route: '/clients-fournisseurs' },
        { label: 'Gestion Contacts', icon: 'contact_phone', route: '/clients-fournisseurs/contacts' }
      ],
      permission: { module: 'Clients', action: 'Read' }
    },
    {
      label: 'Administration',
      icon: 'admin_panel_settings',
      children: [
        { label: 'Utilisateurs', icon: 'person', route: '/utilisateurs' },
        { label: 'Rôles & Permissions', icon: 'security', route: '/utilisateurs/roles' },
        { label: 'Paramètres', icon: 'settings', route: '/admin/parametres' }
      ],
      permission: { module: 'Users', action: 'Read' }
    },
    {
      label: 'Rapports & Analytics',
      icon: 'analytics',
      children: [
        { label: 'Rapports de Stock', icon: 'assessment', route: '/rapports/stock' },
        { label: 'Rapports de Ventes', icon: 'trending_up', route: '/rapports/ventes' },
        { label: 'Analytics', icon: 'insights', route: '/rapports/analytics' }
      ],
      permission: { module: 'Rapports', action: 'Read' }
    },
    {
      label: 'Chatbot IA',
      icon: 'smart_toy',
      route: '/chatbot',
      permission: { module: 'Chatbot', action: 'Read' }
    }
  ];

  constructor(private authService: AuthService) {}

  hasPermission(item: MenuItem): boolean {
    // Pour le développement, afficher tous les modules
    // TODO: Implémenter la logique de permissions plus tard
    return true;
    
    // Code original (à utiliser en production) :
    // if (!item.permission) {
    //   return true;
    // }
    // return this.authService.hasPermission(item.permission.module, item.permission.action);
  }
}
