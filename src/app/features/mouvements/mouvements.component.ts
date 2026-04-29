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

import { MouvementService, MouvementStock } from '../../core/services/mouvement.service';
import { StockService, Article } from '../stock/stock.service';
import { EmplacementService, Emplacement } from '../../core/services/emplacement.service';

interface MouvementStats {
  totalMouvements: number;
  entrees: number;
  sorties: number;
  transferts: number;
}

@Component({
  selector: 'app-mouvements',
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
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './mouvements.component.html',
  styleUrls: ['./mouvements.component.scss']
})
export class MouvementsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = ['date', 'type', 'article', 'quantite', 'emplacements', 'motif', 'utilisateur', 'statut', 'actions'];
  dataSource = new MatTableDataSource<MouvementStock>([]);

  // Pagination
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;

  // Filters
  searchTerm = '';
  selectedType = '';
  selectedArticle = '';
  selectedEmplacement = '';
  selectedPeriode = '';

  // Data
  mouvements: MouvementStock[] = [];
  articles: Article[] = [];
  emplacements: Emplacement[] = [];
  stats: MouvementStats | null = null;

  // States
  loading = true;

  constructor(
    private mouvementService: MouvementService,
    private stockService: StockService,
    private emplacementService: EmplacementService,
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

    // Load mouvements
    this.mouvementService.getAll().subscribe({
      next: (mouvements) => {
        this.mouvements = mouvements;
        this.dataSource.data = mouvements;
        this.totalItems = mouvements.length;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des mouvements:', error);
        this.snackBar.open('Erreur lors du chargement des mouvements', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });

    // Load articles for filter
    this.stockService.getAll().subscribe({
      next: (stocks) => {
        const articleMap = new Map<number, Article>();
        stocks.forEach(stock => {
          if (stock.article && !articleMap.has(stock.article.id)) {
            articleMap.set(stock.article.id, stock.article);
          }
        });
        this.articles = Array.from(articleMap.values());
      },
      error: (error) => {
        console.error('Erreur lors du chargement des articles:', error);
      }
    });

    // Load emplacements for filter
    this.emplacementService.getAll().subscribe({
      next: (emplacements) => {
        this.emplacements = emplacements;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des emplacements:', error);
      }
    });
  }

  calculateStats(): void {
    const total = this.mouvements.length;
    const entrees = this.mouvements.filter(m => m.typeMouvement === 'Entree').length;
    const sorties = this.mouvements.filter(m => m.typeMouvement === 'Sortie').length;
    const transferts = this.mouvements.filter(m => m.typeMouvement === 'Transfert').length;

    this.stats = {
      totalMouvements: total,
      entrees: entrees,
      sorties: sorties,
      transferts: transferts
    };
  }

  // Search and filters
  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filteredData = [...this.mouvements];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(mouvement =>
        (mouvement.article?.designation && mouvement.article.designation.toLowerCase().includes(term)) ||
        (mouvement.article?.reference && mouvement.article.reference.toLowerCase().includes(term)) ||
        mouvement.motif.toLowerCase().includes(term) ||
        (mouvement.referenceDocument && mouvement.referenceDocument.toLowerCase().includes(term))
      );
    }

    // Type filter
    if (this.selectedType) {
      filteredData = filteredData.filter(mouvement => mouvement.typeMouvement === this.selectedType);
    }

    // Article filter
    if (this.selectedArticle) {
      filteredData = filteredData.filter(mouvement =>
        mouvement.articleId?.toString() === this.selectedArticle
      );
    }

    // Emplacement filter
    if (this.selectedEmplacement) {
      filteredData = filteredData.filter(mouvement =>
        mouvement.emplacementSourceId?.toString() === this.selectedEmplacement ||
        mouvement.emplacementDestinationId?.toString() === this.selectedEmplacement
      );
    }

    // Period filter
    if (this.selectedPeriode) {
      const now = new Date();
      const startDate = this.getStartDateForPeriod(this.selectedPeriode, now);
      filteredData = filteredData.filter(mouvement => {
        const mouvementDate = new Date(mouvement.dateMouvement);
        return mouvementDate >= startDate && mouvementDate <= now;
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
    this.selectedType = '';
    this.selectedArticle = '';
    this.selectedEmplacement = '';
    this.selectedPeriode = '';
    this.dataSource.data = this.mouvements;
    this.totalItems = this.mouvements.length;
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

  // Type helpers
  getTypeColor(type: string): string {
    switch (type) {
      case 'Entree': return 'primary';
      case 'Sortie': return 'warn';
      case 'Transfert': return 'accent';
      case 'Ajustement': return 'primary';
      default: return 'accent';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'Entree': return 'input';
      case 'Sortie': return 'output';
      case 'Transfert': return 'compare_arrows';
      case 'Ajustement': return 'tune';
      default: return 'help';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'Entree': return 'Entrée';
      case 'Sortie': return 'Sortie';
      case 'Transfert': return 'Transfert';
      case 'Ajustement': return 'Ajustement';
      default: return type;
    }
  }

  // Quantité helpers
  getQuantiteClass(mouvement: MouvementStock): string {
    switch (mouvement.typeMouvement) {
      case 'Entree': return 'positive';
      case 'Sortie': return 'negative';
      case 'Transfert': return 'neutral';
      case 'Ajustement': return mouvement.quantite > 0 ? 'positive' : 'negative';
      default: return 'neutral';
    }
  }

  getQuantiteDisplay(mouvement: MouvementStock): string {
    const qty = mouvement.quantite;
    switch (mouvement.typeMouvement) {
      case 'Entree':
        return `+${qty}`;
      case 'Sortie':
        return `-${qty}`;
      case 'Transfert':
        return `${qty}`;
      case 'Ajustement':
        return qty > 0 ? `+${qty}` : `${qty}`;
      default:
        return `${qty}`;
    }
  }

  // Status helpers
  getStatutColor(statut: string): string {
    switch (statut) {
      case 'BROUILLON': return 'accent';
      case 'VALIDE': return 'primary';
      case 'ANNULE': return 'warn';
      default: return 'accent';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'BROUILLON': return 'Brouillon';
      case 'VALIDE': return 'Validé';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  }

  // Actions
  openMouvementForm(): void {
    this.router.navigate(['/mouvements/nouveau']);
  }

  viewMouvement(mouvement: MouvementStock): void {
    this.router.navigate(['/mouvements', mouvement.id]);
  }

  editMouvement(mouvement: MouvementStock): void {
    this.router.navigate(['/mouvements', mouvement.id, 'modifier']);
  }

  duplicateMouvement(mouvement: MouvementStock): void {
    this.snackBar.open('Fonctionnalité de duplication en cours de développement', 'Fermer', { duration: 3000 });
  }

  viewArticleHistory(articleId: number): void {
    this.router.navigate(['/mouvements'], { queryParams: { articleId: articleId } });
  }

  validerMouvement(mouvement: MouvementStock): void {
    if (confirm(`Êtes-vous sûr de vouloir valider ce mouvement ?`)) {
      this.snackBar.open('Validation en cours de développement', 'Fermer', { duration: 3000 });
    }
  }

  annulerMouvement(mouvement: MouvementStock): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler ce mouvement ?`)) {
      this.snackBar.open('Annulation en cours de développement', 'Fermer', { duration: 3000 });
    }
  }

  exportMouvements(): void {
    this.snackBar.open('Fonctionnalité d\'export en cours de développement', 'Fermer', { duration: 3000 });
  }
}


