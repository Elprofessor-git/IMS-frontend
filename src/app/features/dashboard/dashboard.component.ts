import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';

import { DashboardService } from './services/dashboard.service';
import { DashboardData } from './models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  dashboardData$: Observable<DashboardData>;

  quickActions = [
    { title: 'Nouvelle Commande', icon: 'add_shopping_cart', route: '/commandes', color: 'primary' },
    { title: 'Ajouter Article', icon: 'add_box', route: '/stock', color: 'accent' },
    { title: 'Nouvelle Tâche', icon: 'assignment_add', route: '/taches', color: 'warn' },
    { title: 'Gérer Clients', icon: 'people', route: '/clients-fournisseurs', color: 'primary' }
  ];

  constructor(private dashboardService: DashboardService) {
    this.dashboardData$ = this.dashboardService.getDashboardData();
  }
}


