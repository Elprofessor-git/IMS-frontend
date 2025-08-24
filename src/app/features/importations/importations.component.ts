import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
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
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ImportationService, Importation, LigneImportation } from '../../core/services/importation.service';
import { FournisseurService } from '../../core/services/fournisseur.service';
import { Fournisseur } from '../../shared/models/common.model';

interface ImportationStats {
  totalImportations: number;
  importationsEnCours: number;
  importationsLivrees: number;
  montantTotal: number;
}

@Component({
  selector: 'app-importations',
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
  templateUrl: './importations.component.html',
  styleUrls: ['./importations.component.scss']
})
export class ImportationsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'reference',
    'fournisseur',
    'statut',
    'modeExpedition',
    'articles',
    'montant',
    'progression',
    'actions'
  ];
  dataSource = new MatTableDataSource<Importation>([]);

  // Data
  importations: Importation[] = [];
  fournisseurs: Fournisseur[] = [];
  stats: ImportationStats | null = null;

  // Filters
  searchTerm = '';
  selectedStatut = '';
  selectedFournisseur = '';
  selectedModeExpedition = '';
  selectedPeriode = '';

  // Pagination
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;

  // UI State
  loading = false;

  constructor(
    private importationService: ImportationService,
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadFournisseurs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    this.loading = true;

    this.importationService.getAll().subscribe({
      next: (data) => {
        this.importations = data;
        this.applyFilters();
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des importations:', error);
        this.snackBar.open('Erreur lors du chargement des importations', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  loadFournisseurs(): void {
    this.fournisseurService.getAll().subscribe({
      next: (data) => {
        this.fournisseurs = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des fournisseurs:', error);
      }
    });
  }

  calculateStats(): void {
    const totalImportations = this.importations.length;
    const importationsEnCours = this.importations.filter(i =>
      ['EN_PREPARATION', 'EXPEDIE', 'EN_TRANSIT', 'ARRIVE'].includes(i.statut)
    ).length;
    const importationsLivrees = this.importations.filter(i => i.statut === 'LIVRE').length;
    const montantTotal = this.importations.reduce((sum, i) => sum + (i.montantTotal || 0), 0);

    this.stats = {
      totalImportations,
      importationsEnCours,
      importationsLivrees,
      montantTotal
    };
  }

  applyFilters(): void {
    let filteredData = [...this.importations];

    // Filtre par terme de recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(importation =>
        importation.referenceImportation?.toLowerCase().includes(term) ||
        importation.fournisseur?.nom?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (this.selectedStatut) {
      filteredData = filteredData.filter(importation =>
        importation.statut === this.selectedStatut
      );
    }

    // Filtre par fournisseur
    if (this.selectedFournisseur) {
      filteredData = filteredData.filter(importation =>
        importation.fournisseur?.id === this.selectedFournisseur
      );
    }

    // Filtre par mode d'expédition
    if (this.selectedModeExpedition) {
      filteredData = filteredData.filter(importation =>
        importation.modeExpedition === this.selectedModeExpedition
      );
    }

    // Filtre par période
    if (this.selectedPeriode) {
      const now = new Date();
      filteredData = filteredData.filter(importation => {
        if (!importation.dateImportation) return false;
        const importationDate = new Date(importation.dateImportation);

        switch (this.selectedPeriode) {
          case 'AUJOURD_HUI':
            return importationDate.toDateString() === now.toDateString();
          case 'CETTE_SEMAINE':
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            return importationDate >= weekStart;
          case 'CE_MOIS':
            return importationDate.getMonth() === now.getMonth() &&
                   importationDate.getFullYear() === now.getFullYear();
          case 'CE_TRIMESTRE':
            const quarter = Math.floor(now.getMonth() / 3);
            const importationQuarter = Math.floor(importationDate.getMonth() / 3);
            return importationQuarter === quarter &&
                   importationDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
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
    this.selectedStatut = '';
    this.selectedFournisseur = '';
    this.selectedModeExpedition = '';
    this.selectedPeriode = '';
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
  getStatutColor(statut: string): 'primary' | 'accent' | 'warn' {
    switch (statut) {
      case 'LIVRE': return 'primary';
      case 'EN_TRANSIT':
      case 'ARRIVE': return 'accent';
      case 'ANNULE': return 'warn';
      default: return 'primary';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'EN_PREPARATION': return 'schedule';
      case 'EXPEDIE': return 'local_shipping';
      case 'EN_TRANSIT': return 'flight';
      case 'ARRIVE': return 'flight_land';
      case 'LIVRE': return 'check_circle';
      case 'ANNULE': return 'cancel';
      default: return 'help';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_PREPARATION': return 'En préparation';
      case 'EXPEDIE': return 'Expédié';
      case 'EN_TRANSIT': return 'En transit';
      case 'ARRIVE': return 'Arrivé';
      case 'LIVRE': return 'Livré';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  }

  getModeIcon(mode: string): string {
    switch (mode) {
      case 'MARITIME': return 'directions_boat';
      case 'AERIEN': return 'flight';
      case 'ROUTIER': return 'local_shipping';
      case 'FERROVIAIRE': return 'train';
      default: return 'help';
    }
  }

  getModeLabel(mode: string): string {
    switch (mode) {
      case 'MARITIME': return 'Maritime';
      case 'AERIEN': return 'Aérien';
      case 'ROUTIER': return 'Routier';
      case 'FERROVIAIRE': return 'Ferroviaire';
      default: return mode;
    }
  }

  getProgressionValue(statut: string): number {
    switch (statut) {
      case 'EN_PREPARATION': return 20;
      case 'EXPEDIE': return 40;
      case 'EN_TRANSIT': return 60;
      case 'ARRIVE': return 80;
      case 'LIVRE': return 100;
      case 'ANNULE': return 0;
      default: return 0;
    }
  }

  getProgressionColor(statut: string): 'primary' | 'accent' | 'warn' {
    switch (statut) {
      case 'LIVRE': return 'primary';
      case 'ANNULE': return 'warn';
      default: return 'accent';
    }
  }

  getProgressionText(statut: string): string {
    return `${this.getProgressionValue(statut)}%`;
  }

  // Action methods
  openImportationForm(): void {
    this.snackBar.open('Fonctionnalité en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  viewImportation(importation: Importation): void {
    this.snackBar.open(`Affichage des détails de ${importation.referenceImportation}`, 'Fermer', {
      duration: 3000
    });
  }

  editImportation(importation: Importation): void {
    this.snackBar.open(`Modification de ${importation.referenceImportation}`, 'Fermer', {
      duration: 3000
    });
  }

  duplicateImportation(importation: Importation): void {
    this.snackBar.open(`Duplication de ${importation.referenceImportation}`, 'Fermer', {
      duration: 3000
    });
  }

  generateDocuments(importation: Importation): void {
    this.snackBar.open(`Génération des documents douaniers pour ${importation.referenceImportation}`, 'Fermer', {
      duration: 3000
    });
  }

  trackShipment(importation: Importation): void {
    this.snackBar.open(`Suivi du colis ${importation.referenceImportation}`, 'Fermer', {
      duration: 3000
    });
  }

  updateStatut(importation: Importation, nouveauStatut: string): void {
    this.importationService.updateStatut(importation.id!, nouveauStatut).subscribe({
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

  annulerImportation(importation: Importation): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler l'importation ${importation.referenceImportation} ?`)) {
      this.updateStatut(importation, 'ANNULE');
    }
  }

  exportImportations(): void {
    this.snackBar.open('Export en cours de développement', 'Fermer', {
      duration: 3000
    });
  }
}
