import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { EmplacementService, Emplacement, EmplacementStats } from '../../core/services/emplacement.service';

@Component({
  selector: 'app-emplacements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule
  ],
  templateUrl: './emplacements.component.html',
  styleUrls: ['./emplacements.component.scss']
})
export class EmplacementsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'code',
    'nom',
    'type',
    'capacite',
    'utilisation',
    'statut',
    'actions'
  ];
  dataSource = new MatTableDataSource<Emplacement>([]);

  // Data
  emplacements: Emplacement[] = [];
  stats: EmplacementStats | null = null;

  // Filters
  searchTerm = '';
  selectedType = '';
  selectedStatut = '';
  selectedZone = '';

  // Pagination
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;

  // UI State
  loading = false;

  constructor(
    private emplacementService: EmplacementService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    this.loading = true;

    this.emplacementService.getAll().subscribe({
      next: (data) => {
        this.emplacements = data;
        this.applyFilters();
        this.loadStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des emplacements:', error);
        this.snackBar.open('Erreur lors du chargement des emplacements', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.emplacementService.getStatistiques().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  applyFilters(): void {
    let filteredData = [...this.emplacements];

    // Filtre par terme de recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(emplacement =>
        emplacement.code?.toLowerCase().includes(term) ||
        emplacement.nom?.toLowerCase().includes(term) ||
        emplacement.description?.toLowerCase().includes(term)
      );
    }

    // Filtre par type
    if (this.selectedType) {
      filteredData = filteredData.filter(emplacement =>
        emplacement.typeEmplacement === this.selectedType
      );
    }

    // Filtre par statut
    if (this.selectedStatut) {
      filteredData = filteredData.filter(emplacement =>
        emplacement.statut === this.selectedStatut
      );
    }

    // Filtre par zone (using chemin as zone alternative since zone doesn't exist in interface)
    if (this.selectedZone) {
      filteredData = filteredData.filter(emplacement =>
        emplacement.chemin?.includes(this.selectedZone)
      );
    }

    this.dataSource.data = filteredData;
    this.totalItems = filteredData.length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatut = '';
    this.selectedZone = '';
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // Helper methods for display
  getTypeColor(type: string): 'primary' | 'accent' | 'warn' {
    switch (type) {
      case 'ENTREPOT': return 'primary';
      case 'ZONE_STOCKAGE': return 'accent';
      case 'ZONE_EXPEDITION': return 'warn';
      default: return 'primary';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'ENTREPOT': return 'warehouse';
      case 'ZONE_STOCKAGE': return 'inventory';
      case 'ZONE_EXPEDITION': return 'local_shipping';
      case 'ZONE_RECEPTION': return 'move_to_inbox';
      default: return 'place';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'ENTREPOT': return 'Entrepôt';
      case 'ZONE_STOCKAGE': return 'Zone de stockage';
      case 'ZONE_EXPEDITION': return 'Zone d\'expédition';
      case 'ZONE_RECEPTION': return 'Zone de réception';
      default: return type;
    }
  }

  getStatutColor(statut: string): 'primary' | 'accent' | 'warn' {
    switch (statut) {
      case 'ACTIF': return 'primary';
      case 'MAINTENANCE': return 'warn';
      case 'INACTIF': return 'warn';
      default: return 'primary';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'check_circle';
      case 'MAINTENANCE': return 'build';
      case 'INACTIF': return 'cancel';
      default: return 'help';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'Actif';
      case 'MAINTENANCE': return 'Maintenance';
      case 'INACTIF': return 'Inactif';
      default: return statut;
    }
  }

  getUtilisationPercentage(emplacement: Emplacement): number {
    if (!emplacement.capaciteMax || emplacement.capaciteMax === 0) {
      return 0;
    }
    const capaciteUtilisee = emplacement.capaciteActuelle || 0;
    return Math.round((capaciteUtilisee / emplacement.capaciteMax) * 100);
  }

  getUtilisationColor(percentage: number): 'primary' | 'accent' | 'warn' {
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }

  // Action methods
  openEmplacementForm(): void {
    this.snackBar.open('Fonctionnalité en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  viewEmplacement(emplacement: Emplacement): void {
    this.snackBar.open(`Affichage des détails de ${emplacement.nom}`, 'Fermer', {
      duration: 3000
    });
  }

  editEmplacement(emplacement: Emplacement): void {
    this.snackBar.open(`Modification de ${emplacement.nom}`, 'Fermer', {
      duration: 3000
    });
  }

  duplicateEmplacement(emplacement: Emplacement): void {
    this.snackBar.open(`Duplication de ${emplacement.nom}`, 'Fermer', {
      duration: 3000
    });
  }

  toggleStatut(emplacement: Emplacement): void {
    const nouveauStatut = emplacement.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';

    this.emplacementService.updateStatut(emplacement.id!, nouveauStatut).subscribe({
      next: () => {
        this.snackBar.open(`Statut mis à jour: ${this.getStatutLabel(nouveauStatut)}`, 'Fermer', {
          duration: 3000
        });
        this.loadData();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.snackBar.open('Erreur lors de la mise à jour du statut', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  deleteEmplacement(emplacement: Emplacement): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'emplacement ${emplacement.nom} ?`)) {
      this.emplacementService.delete(emplacement.id!).subscribe({
        next: () => {
          this.snackBar.open('Emplacement supprimé avec succès', 'Fermer', {
            duration: 3000
          });
          this.loadData();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }

  exportEmplacements(): void {
    this.snackBar.open('Export en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  optimiserEmplacements(): void {
    this.snackBar.open('Optimisation en cours de développement', 'Fermer', {
      duration: 3000
    });
  }
}
