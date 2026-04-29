import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    HeaderComponent,
    SidebarComponent
  ],
  template: `
    <div class="app-container">
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #drawer class="sidenav" fixedInViewport mode="side" opened>
          <app-sidebar></app-sidebar>
        </mat-sidenav>
        <mat-sidenav-content>
          <app-header (menuToggle)="drawer.toggle()"></app-header>
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
    }

    .sidenav-container {
      height: 100%;
    }

    .sidenav {
      width: 250px;
      background-color: #f5f5f5;
    }

    .main-content {
      padding: 20px;
      min-height: calc(100vh - 64px);
      background-color: #fafafa;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 200px;
      }

      .main-content {
        padding: 10px;
      }
    }
  `]
})
export class AppComponent {
  title = 'Système de Gestion Textile';
}


