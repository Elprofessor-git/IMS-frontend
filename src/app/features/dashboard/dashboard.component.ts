import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { StockService } from '../../core/services/stock.service';
import { CommandeService } from '../../core/services/commande.service';
import { TacheService } from '../../core/services/tache.service';
import { environment } from '../../../environments/environment';

interface DashboardCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  route: string;
  description: string;
  loading?: boolean;
}

interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  time: string;
  status: string;
}

interface Alert {
  id: number;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  icon: string;
}

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
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardCards: DashboardCard[] = [
    {
      title: 'Articles en Stock',
      value: 0,
      icon: 'inventory',
      color: 'primary',
      route: '/stock',
      description: 'Total des articles disponibles',
      loading: true
    },
    {
      title: 'Commandes Actives',
      value: 0,
      icon: 'shopping_cart',
      color: 'accent',
      route: '/commandes',
      description: 'Commandes en cours de traitement',
      loading: true
    },
    {
      title: 'Tâches en Cours',
      value: 0,
      icon: 'assignment',
      color: 'warn',
      route: '/taches',
      description: 'Tâches de production actives',
      loading: true
    },
    {
      title: 'Valeur du Stock',
      value: 0,
      icon: 'euro',
      color: 'success',
      route: '/stock',
      description: 'Valeur totale du stock',
      loading: true
    }
  ];

  quickActions: QuickAction[] = [
    {
      title: 'Nouvelle Commande',
      icon: 'add_shopping_cart',
      route: '/commandes',
      color: 'primary'
    },
    {
      title: 'Ajouter Article',
      icon: 'add_box',
      route: '/stock',
      color: 'accent'
    },
    {
      title: 'Nouvelle Tâche',
      icon: 'assignment_add',
      route: '/taches',
      color: 'warn'
    },
    {
      title: 'Gérer Clients',
      icon: 'people',
      route: '/clients-fournisseurs',
      color: 'primary'
    }
  ];

  recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'commande',
      description: 'Nouvelle commande #CMD-2024-001 créée',
      time: 'Il y a 2 heures',
      status: 'En cours'
    },
    {
      id: 2,
      type: 'stock',
      description: 'Article "Tissu Coton" ajouté au stock',
      time: 'Il y a 4 heures',
      status: 'Terminé'
    },
    {
      id: 3,
      type: 'tache',
      description: 'Tâche "Production Lot #123" démarrée',
      time: 'Il y a 6 heures',
      status: 'En cours'
    }
  ];

  alerts: Alert[] = [
    {
      id: 1,
      type: 'warning',
      title: 'Stock Faible',
      message: '5 articles ont un stock inférieur au seuil minimum',
      icon: 'warning'
    },
    {
      id: 2,
      type: 'info',
      title: 'Commandes en Attente',
      message: '3 commandes nécessitent votre attention',
      icon: 'info'
    }
  ];

  constructor(
    private stockService: StockService,
    private commandeService: CommandeService,
    private tacheService: TacheService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Charger les statistiques de stock
    this.stockService.getAll().subscribe({
      next: (stocks) => {
        this.dashboardCards[0].value = stocks.length;
        this.dashboardCards[0].loading = false;
        
        // Calculer la valeur totale du stock
        const totalValue = stocks.reduce((sum, stock) => sum + (stock.prix * stock.quantite), 0);
        this.dashboardCards[3].value = totalValue;
        this.dashboardCards[3].loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stocks:', error);
        this.dashboardCards[0].loading = false;
        this.dashboardCards[3].loading = false;
      }
    });

    // Charger les statistiques de commandes
    this.commandeService.getAll().subscribe({
      next: (commandes: any[]) => {
        const activeCommandes = commandes.filter(c => c.statut === 'EnCours' || c.statut === 'EnAttente');
        this.dashboardCards[1].value = activeCommandes.length;
        this.dashboardCards[1].loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.dashboardCards[1].loading = false;
      }
    });

    // Charger les statistiques de tâches
    this.tacheService.getAll().subscribe({
      next: (taches: any[]) => {
        const activeTaches = taches.filter(t => !t.estTerminee);
        this.dashboardCards[2].value = activeTaches.length;
        this.dashboardCards[2].loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des tâches:', error);
        this.dashboardCards[2].loading = false;
      }
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'commande': return 'shopping_cart';
      case 'stock': return 'inventory';
      case 'tache': return 'assignment';
      default: return 'info';
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'terminé':
      case 'actif':
        return 'success';
      case 'en cours':
      case 'en attente':
        return 'warning';
      case 'annulé':
      case 'erreur':
        return 'error';
      default:
        return 'info';
    }
  }

  dismissAlert(alertId: number): void {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
    this.snackBar.open('Alerte supprimée', 'Fermer', {
      duration: 2000
    });
  }
}
