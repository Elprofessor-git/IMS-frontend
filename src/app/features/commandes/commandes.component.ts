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

import { CommandeService } from './commande.service';
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
    totalMontant: 0
  };

  constructor(
    private commandeService: CommandeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
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

    this.commandeService.getAll().subscribe({
      next: (orders) => {
        let filtered = orders;

        if (this.searchTerm.trim()) {
          const term = this.searchTerm.toLowerCase();
          filtered = filtered.filter(o =>
            o.numeroCommande?.toLowerCase().includes(term) ||
            o.client?.nom?.toLowerCase().includes(term) ||
            o.client?.prenom?.toLowerCase().includes(term) ||
            (o.client as any)?.plateforme?.nom?.toLowerCase().includes(term)
          );
        }

        if (this.selectedStatus) {
          filtered = filtered.filter(o => o.statut === this.selectedStatus);
        }

        if (this.dateRange.start) {
          filtered = filtered.filter(o =>
            new Date(o.dateCreation) >= this.dateRange.start!
          );
        }

        if (this.dateRange.end) {
          filtered = filtered.filter(o =>
            new Date(o.dateCreation) <= this.dateRange.end!
          );
        }

        this.dataSource.data = filtered;
        this.totalOrders = filtered.length;
        this.calculateStatistics(filtered);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.snackBar.open('Erreur lors du chargement des commandes', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculateStatistics(orders: CommandeClient[]): void {
    const pending = orders.filter(o => o.statut === StatutCommande.EnAttente).length;
    const confirmed = orders.filter(o => o.statut === StatutCommande.Prete).length;
    const shipped = orders.filter(o => o.statut === StatutCommande.Terminee).length;
    const totalMontant = orders.reduce((sum, o) => sum + (o.montantTotal || 0), 0);

    this.statistics = {
      pending,
      confirmed,
      shipped,
      totalMontant
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
      case 'EnAttente':    return 'status-pending';
      case 'Prete':        return 'status-confirmed';
      case 'EnProduction': return 'status-preparation';
      case 'Terminee':     return 'status-delivered';
      case 'Annulee':      return 'status-cancelled';
      default:             return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'EnAttente':    return 'hourglass_empty';
      case 'Prete':        return 'check_circle';
      case 'EnProduction': return 'build';
      case 'Terminee':     return 'done_all';
      case 'Annulee':      return 'cancel';
      default:             return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EnAttente':    return 'En Attente';
      case 'Prete':        return 'Prête';
      case 'EnProduction': return 'En Production';
      case 'Terminee':     return 'Terminée';
      case 'Annulee':      return 'Annulée';
      default:             return status || 'Inconnu';
    }
  }

  // Action methods
  openNewOrderDialog(): void {
    this.router.navigate(['/commandes/nouveau']);
  }

  viewOrder(order: CommandeClient): void {
    this.router.navigate(['/commandes', order.id, 'details']);
  }

  editOrder(order: CommandeClient): void {
    this.router.navigate(['/commandes', order.id]);
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
      this.commandeService.delete(order.id).subscribe({
        next: () => {
          this.snackBar.open('Commande supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadOrders();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
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


