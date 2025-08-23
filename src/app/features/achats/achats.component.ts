import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { AchatService, Achat } from '../../core/services/achat.service';

interface AchatStats {
  totalAchats: number;
  achatsEnAttente: number;
  achatsLivres: number;
  montantTotal: number;
}

interface Fournisseur {
  id: number;
  nom: string;
  email?: string;
}

@Component({
  selector: 'app-achats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule
  ],
  templateUrl: './achats.component.html',
  styleUrls: ['./achats.component.scss']
})
export class AchatsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = ['reference', 'fournisseur', 'statut', 'dates', 'montant', 'articles', 'actions'];
  dataSource = new MatTableDataSource<Achat>([]);
  
  // Pagination
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;
  
  // Filters
  searchTerm = '';
  selectedStatut = '';
  selectedFournisseur = '';
  selectedPeriode = '';
  
  // Data
  achats: Achat[] = [];
  fournisseurs: Fournisseur[] = [];
  stats: AchatStats | null = null;
  
  // States
  loading = true;
  
  constructor(
    private achatService: AchatService,
    private router: Router,
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
    
    // Load achats
    this.achatService.getAll().subscribe({
      next: (achats) => {
        this.achats = achats;
        this.dataSource.data = achats;
        this.totalItems = achats.length;
        this.calculateStats();
        this.extractFournisseurs();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des achats:', error);
        this.snackBar.open('Erreur lors du chargement des achats', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    const total = this.achats.length;
    const enAttente = this.achats.filter(a => ['BROUILLON', 'CONFIRME', 'EXPEDIE'].includes(a.statut)).length;
    const livres = this.achats.filter(a => a.statut === 'LIVRE').length;
    const montantTotal = this.achats.reduce((sum, a) => sum + (a.montantTotal || 0), 0);
    
    this.stats = {
      totalAchats: total,
      achatsEnAttente: enAttente,
      achatsLivres: livres,
      montantTotal: montantTotal
    };
  }

  extractFournisseurs(): void {
    const fournisseursMap = new Map<number, Fournisseur>();
    
    this.achats.forEach(achat => {
      if (achat.fournisseur && achat.fournisseur.id) {
        fournisseursMap.set(achat.fournisseur.id, {
          id: achat.fournisseur.id,
          nom: achat.fournisseur.nom,
          email: achat.fournisseur.email
        });
      }
    });
    
    this.fournisseurs = Array.from(fournisseursMap.values());
  }

  // Search and filters
  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filteredData = [...this.achats];
    
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(achat => 
        achat.referenceAchat.toLowerCase().includes(term) ||
        (achat.fournisseur?.nom && achat.fournisseur.nom.toLowerCase().includes(term))
      );
    }
    
    // Status filter
    if (this.selectedStatut) {
      filteredData = filteredData.filter(achat => achat.statut === this.selectedStatut);
    }
    
    // Fournisseur filter
    if (this.selectedFournisseur) {
      filteredData = filteredData.filter(achat => 
        achat.fournisseurId?.toString() === this.selectedFournisseur
      );
    }
    
    // Period filter
    if (this.selectedPeriode) {
      const now = new Date();
      const startDate = this.getStartDateForPeriod(this.selectedPeriode, now);
      filteredData = filteredData.filter(achat => {
        const achatDate = new Date(achat.dateAchat);
        return achatDate >= startDate && achatDate <= now;
      });
    }
    
    this.dataSource.data = filteredData;
    this.totalItems = filteredData.length;
  }

  getStartDateForPeriod(periode: string, now: Date): Date {
    const startDate = new Date(now);
    
    switch (periode) {
      case 'AUJOURD_HUI':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'CETTE_SEMAINE':
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'CE_MOIS':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'CE_TRIMESTRE':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate.setMonth(quarter * 3, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }
    
    return startDate;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatut = '';
    this.selectedFournisseur = '';
    this.selectedPeriode = '';
    this.dataSource.data = this.achats;
    this.totalItems = this.achats.length;
  }

  // Pagination
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // Status helpers
  getStatutColor(statut: string): string {
    switch (statut) {
      case 'BROUILLON': return 'accent';
      case 'CONFIRME': return 'primary';
      case 'EXPEDIE': return 'primary';
      case 'LIVRE': return 'primary';
      case 'ANNULE': return 'warn';
      default: return 'accent';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'BROUILLON': return 'edit';
      case 'CONFIRME': return 'check';
      case 'EXPEDIE': return 'local_shipping';
      case 'LIVRE': return 'check_circle';
      case 'ANNULE': return 'cancel';
      default: return 'help';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'BROUILLON': return 'Brouillon';
      case 'CONFIRME': return 'Confirmé';
      case 'EXPEDIE': return 'Expédié';
      case 'LIVRE': return 'Livré';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  }

  // Actions
  openAchatForm(): void {
    this.router.navigate(['/achats/nouveau']);
  }

  viewAchat(achat: Achat): void {
    this.router.navigate(['/achats', achat.id]);
  }

  editAchat(achat: Achat): void {
    this.router.navigate(['/achats', achat.id, 'modifier']);
  }

  duplicateAchat(achat: Achat): void {
    this.snackBar.open('Fonctionnalité de duplication en cours de développement', 'Fermer', { duration: 3000 });
  }

  generateBonCommande(achat: Achat): void {
    this.snackBar.open('Génération du bon de commande en cours de développement', 'Fermer', { duration: 3000 });
  }

  generateFacture(achat: Achat): void {
    this.snackBar.open('Génération de la facture en cours de développement', 'Fermer', { duration: 3000 });
  }

  validerAchat(achat: Achat): void {
    if (confirm(`Êtes-vous sûr de vouloir valider l'achat "${achat.referenceAchat}" ?`)) {
      // Implementation for validation
      this.snackBar.open('Validation en cours de développement', 'Fermer', { duration: 3000 });
    }
  }

  confirmerLivraison(achat: Achat): void {
    if (confirm(`Confirmer la livraison de l'achat "${achat.referenceAchat}" ?`)) {
      // Implementation for delivery confirmation
      this.snackBar.open('Confirmation de livraison en cours de développement', 'Fermer', { duration: 3000 });
    }
  }

  annulerAchat(achat: Achat): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler l'achat "${achat.referenceAchat}" ?`)) {
      // Implementation for cancellation
      this.snackBar.open('Annulation en cours de développement', 'Fermer', { duration: 3000 });
    }
  }

  exportAchats(): void {
    this.snackBar.open('Fonctionnalité d\'export en cours de développement', 'Fermer', { duration: 3000 });
  }
}
