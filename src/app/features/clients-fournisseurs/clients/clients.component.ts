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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../shared/models/commande.model';

@Component({
  selector: 'app-clients',
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
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'nom',
    'email',
    'telephone',
    'adresse',
    'dateCreation',
    'statut',
    'actions'
  ];

  dataSource = new MatTableDataSource<Client>([]);
  selection = new SelectionModel<Client>(true, []);

  // Loading and pagination
  loading = false;
  totalClients = 0;
  pageSize = 25;
  currentPage = 0;

  // Filters
  searchTerm = '';
  selectedStatus = '';

  // Statistics
  statistics = {
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0
  };

  constructor(
    private clientService: ClientService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClients();
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
  loadClients(): void {
    this.loading = true;

    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.dataSource.data = clients;
        this.totalClients = clients.length;
        this.calculateStatistics(clients);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients:', error);
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculateStatistics(clients: Client[]): void {
    const total = clients.length;
    const active = clients.filter(c => c.actif).length;
    const inactive = total - active;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = clients.filter(c => new Date(c.dateCreation) >= firstDayOfMonth).length;

    this.statistics = {
      total,
      active,
      inactive,
      newThisMonth
    };
  }

  // Filter methods
  onSearch(): void {
    this.currentPage = 0;
    this.loadClients();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadClients();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.currentPage = 0;
    this.loadClients();
  }

  // Pagination methods
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadClients();
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
      case 'Actif': return 'status-active';
      case 'Inactif': return 'status-inactive';
      case 'Suspendu': return 'status-suspended';
      default: return 'status-active';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Actif': return 'check_circle';
      case 'Inactif': return 'cancel';
      case 'Suspendu': return 'pause_circle';
      default: return 'help';
    }
  }

  // Action methods
  openNewClientDialog(): void {
    this.router.navigate(['/clients-fournisseurs/clients/nouveau']);
  }

  viewClient(client: Client): void {
    this.router.navigate(['/clients-fournisseurs/clients', client.id]);
  }

  editClient(client: Client): void {
    this.router.navigate(['/clients-fournisseurs/clients/modifier', client.id]);
  }

  deleteClient(client: Client): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le client ${client.nom} ?`)) {
      this.clientService.delete(client.id).subscribe({
        next: () => {
          this.snackBar.open('Client supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadClients();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  // Export methods
  exportClients(): void {
    this.snackBar.open('Fonctionnalité "Export" en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  // Bulk action methods
  bulkActivate(): void {
    this.snackBar.open('Activation en lot en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  bulkDeactivate(): void {
    this.snackBar.open('Désactivation en lot en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  bulkDelete(): void {
    const selectedClients = this.selection.selected;
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedClients.length} client(s) ?`)) {
      this.snackBar.open('Suppression en lot en cours de développement', 'Fermer', {
        duration: 3000
      });
    }
  }
}


