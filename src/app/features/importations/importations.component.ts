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
import { Router } from '@angular/router';
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
    private dialog: MatDialog,
    private router: Router
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
    const enCoursSet = new Set(['Brouillon', 'Soumise', 'Validee']);
    const importationsEnCours = this.importations.filter(i => enCoursSet.has(i.statut)).length;
    const importationsLivrees = this.importations.filter(i => i.statut === 'Recue').length;
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
      case 'Recue': return 'primary';
      case 'Soumise':
      case 'Validee': return 'accent';
      case 'Annulee': return 'warn';
      default: return 'accent';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'Brouillon': return 'draft';
      case 'Soumise': return 'send';
      case 'Validee': return 'verified';
      case 'Recue': return 'inventory_2';
      case 'Annulee': return 'cancel';
      default: return 'help';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'Brouillon': return 'Brouillon';
      case 'Soumise': return 'Soumise';
      case 'Validee': return 'Validée';
      case 'Recue': return 'Reçue';
      case 'Annulee': return 'Annulée';
      default: return statut;
    }
  }

  getModeIcon(mode: string): string {
    switch (mode) {
      case 'Maritime': return 'directions_boat';
      case 'Aerien': return 'flight';
      case 'Terrestre': return 'local_shipping';
      case 'Express': return 'rocket_launch';
      default: return 'help';
    }
  }

  getModeLabel(mode: string): string {
    switch (mode) {
      case 'Maritime': return 'Maritime';
      case 'Aerien': return 'Aérien';
      case 'Terrestre': return 'Terrestre';
      case 'Express': return 'Express';
      default: return mode;
    }
  }

  getProgressionValue(statut: string): number {
    switch (statut) {
      case 'Brouillon': return 10;
      case 'Soumise': return 30;
      case 'Validee': return 60;
      case 'Recue': return 100;
      case 'Annulee': return 0;
      default: return 0;
    }
  }

  getProgressionColor(statut: string): 'primary' | 'accent' | 'warn' {
    switch (statut) {
      case 'Recue': return 'primary';
      case 'Annulee': return 'warn';
      default: return 'accent';
    }
  }

  getProgressionText(statut: string): string {
    return `${this.getProgressionValue(statut)}%`;
  }

  // Action methods
  openImportationForm(): void {
    this.router.navigate(['/importations/new']);
  }

  viewImportation(importation: Importation): void {
    this.snackBar.open(`Affichage des détails de ${importation.referenceImportation}`, 'Fermer', {
      duration: 3000
    });
  }

  editImportation(importation: Importation): void {
    this.router.navigate(['/importations/edit', importation.id]);
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
      error: (error: unknown) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.snackBar.open('Erreur lors de la mise à jour du statut', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  // Actions explicites mappées au backend
  soumettre(importation: Importation): void {
    this.importationService.soumettreImportation(importation.id!).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Fermer', { duration: 3000 });
        this.loadData();
      },
      error: (error: unknown) => this.snackBar.open('Erreur lors de la soumission', 'Fermer', { duration: 3000 })
    });
  }

  valider(importation: Importation): void {
    this.importationService.validerImportation(importation.id!, 'UI').subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Fermer', { duration: 3000 });
        this.loadData();
      },
      error: (error: unknown) => this.snackBar.open('Erreur lors de la validation', 'Fermer', { duration: 3000 })
    });
  }

  recevoir(importation: Importation): void {
    this.importationService.recevoirImportation(importation.id!).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Fermer', { duration: 3000 });
        this.loadData();
      },
      error: (error: unknown) => this.snackBar.open('Erreur lors de la réception', 'Fermer', { duration: 3000 })
    });
  }

  affecter(importation: Importation): void {
    this.importationService.affecterCommandes(importation.id!).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Fermer', { duration: 3000 });
        this.loadData();
      },
      error: (error: unknown) => this.snackBar.open('Erreur lors de l\'affectation aux commandes', 'Fermer', { duration: 3000 })
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


