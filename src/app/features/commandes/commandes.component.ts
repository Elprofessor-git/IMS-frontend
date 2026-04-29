import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort, MatSort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';
import { StatutCommande } from '../../shared/models/commande.model';

import { CommandeService } from '../../core/services/commande.service';
import { CommandeClient } from '../../shared/models/commande.model';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.scss']
})
export class CommandesComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'numeroCommande',
    'client',
    'dateCommande',
    'statut',
    'montantTotal',
    'itemsCount',
    'actions'
  ];

  dataSource = new MatTableDataSource<CommandeClient>([]);
  selection = new SelectionModel<CommandeClient>(true, []);

  // Loading and pagination
  loading = false;
  totalOrders = 0;
  pageSize = 25;
  currentPage = 0;

  // Filters
  searchTerm = '';
  selectedStatus = '';
  dateRange = {
    start: null as Date | null,
    end: null as Date | null
  };

  // Statistics
  statistics = {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    totalRevenue: 0
  };

  constructor(
    private commandeService: CommandeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Data loading methods
  loadOrders(): void {
    this.loading = true;

    const filters = {
      search: this.searchTerm,
      status: this.selectedStatus,
      startDate: this.dateRange.start,
      endDate: this.dateRange.end,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    // Mock data for now - replace with actual service call
    setTimeout(() => {
      this.dataSource.data = [];
      this.totalOrders = 0;
      this.loading = false;
    }, 1000);
  }

  loadStatistics(): void {
    // Mock data for now - replace with actual service call
    this.statistics = {
      pending: 5,
      confirmed: 12,
      shipped: 8,
      totalRevenue: 25000
    };
  }

  // Filter methods
  onSearch(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.dateRange = { start: null, end: null };
    this.currentPage = 0;
    this.loadOrders();
  }

  // Pagination methods
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  // Selection methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  // Status helper methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'En_Attente': return 'status-pending';
      case 'Confirmee': return 'status-confirmed';
      case 'En_Preparation': return 'status-preparation';
      case 'Expediee': return 'status-shipped';
      case 'Livree': return 'status-delivered';
      case 'Annulee': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'En_Attente': return 'hourglass_empty';
      case 'Confirmee': return 'check_circle';
      case 'En_Preparation': return 'build';
      case 'Expediee': return 'local_shipping';
      case 'Livree': return 'done_all';
      case 'Annulee': return 'cancel';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'En_Attente': return 'En Attente';
      case 'Confirmee': return 'Confirmée';
      case 'En_Preparation': return 'En Préparation';
      case 'Expediee': return 'Expédiée';
      case 'Livree': return 'Livrée';
      case 'Annulee': return 'Annulée';
      default: return 'Inconnu';
    }
  }

  // Action methods
  openNewOrderDialog(): void {
    this.router.navigate(['/commandes/new']);
  }

  viewOrder(order: CommandeClient): void {
    this.snackBar.open(`Voir détails de la commande ${order.numeroCommande}`, 'Fermer', {
      duration: 2000
    });
  }

  editOrder(order: CommandeClient): void {
    this.router.navigate(['/commandes/edit', order.id]);
  }

  printOrder(order: CommandeClient): void {
    this.snackBar.open(`Imprimer la commande ${order.numeroCommande}`, 'Fermer', {
      duration: 2000
    });
  }

  validateResources(order: CommandeClient): void {
    this.commandeService.validerRessources(order.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(
          `Validation: ${Math.round(res.pourcentageCouverture)}% - Statut: ${res.statut}`,
          'Fermer',
          { duration: 4000 }
        );
        this.loadOrders();
      },
      error: (err) => {
        this.snackBar.open('Erreur lors de la validation des ressources', 'Fermer', { duration: 3000 });
        console.error(err);
      }
    });
  }

  generateTasks(order: CommandeClient): void {
    this.commandeService.genererTaches(order.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(`Tâches générées (ID ${res.tacheId})`, 'Fermer', { duration: 3000 });
        this.loadOrders();
      },
      error: (err) => {
        const msg = err?.error || 'Erreur lors de la génération des tâches';
        this.snackBar.open(typeof msg === 'string' ? msg : 'Erreur lors de la génération des tâches', 'Fermer', { duration: 3000 });
        console.error(err);
      }
    });
  }

  deleteOrder(order: CommandeClient): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande ${order.numeroCommande} ?`)) {
      this.snackBar.open('Commande supprimée avec succès', 'Fermer', {
        duration: 3000
      });
      this.loadOrders();
    }
  }

  // Export methods
  exportOrders(): void {
    this.snackBar.open('Fonctionnalité "Export" en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  // Bulk action methods
  bulkUpdateStatus(): void {
    this.snackBar.open('Fonctionnalité "Mise à jour en lot" en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  bulkExport(): void {
    this.snackBar.open('Export des commandes sélectionnées en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  bulkPrint(): void {
    this.snackBar.open('Impression des commandes sélectionnées en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  bulkDelete(): void {
    const selectedOrders = this.selection.selected;
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedOrders.length} commande(s) ?`)) {
      this.snackBar.open('Suppression en lot en cours de développement', 'Fermer', {
        duration: 3000
      });
    }
  }

  canBulkDelete(): boolean {
    return this.selection.selected.every(order => order.statut === StatutCommande.EnAttente);
  }
}


