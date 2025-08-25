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

import { StockService } from '../../core/services/stock.service';
import { Stock, Article } from '../../shared/models/stock.model';

interface ArticleStats {
  totalArticles: number;
  articlesEnStock: number;
  articlesStockFaible: number;
  articlesRupture: number;
}

interface Categorie {
  id: number;
  nom: string;
}

@Component({
  selector: 'app-articles',
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
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = ['image', 'article', 'categorie', 'stock', 'prix', 'statut', 'actions'];
  dataSource = new MatTableDataSource<Stock>([]);

  // Pagination
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;

  // Filters
  searchTerm = '';
  selectedCategorie = '';
  selectedStatutStock = '';

  // Data
  stocks: Stock[] = [];
  categories: Categorie[] = [];
  stats: ArticleStats | null = null;

  // States
  loading = true;

  constructor(
    private stockService: StockService,
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

    // Load articles
    this.stockService.getAll().subscribe({
      next: (stocks) => {
        this.stocks = stocks;
        this.dataSource.data = stocks;
        this.totalItems = stocks.length;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des articles:', error);
        this.snackBar.open('Erreur lors du chargement des articles', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });

    // Load categories (mock data for now)
    this.categories = [
      { id: 1, nom: 'Tissus' },
      { id: 2, nom: 'Accessoires' },
      { id: 3, nom: 'Fils' },
      { id: 4, nom: 'Boutons' }
    ];
  }

  calculateStats(): void {
    const total = this.stocks.length;
    const enStock = this.stocks.filter(s => s.quantite > (s.article?.seuilAlerte || 0)).length;
    const stockFaible = this.stocks.filter(s => {
      const qty = s.quantite;
      const seuil = s.article?.seuilAlerte || 0;
      return qty > 0 && qty <= seuil;
    }).length;
    const rupture = this.stocks.filter(s => s.quantite === 0).length;

    this.stats = {
      totalArticles: total,
      articlesEnStock: enStock,
      articlesStockFaible: stockFaible,
      articlesRupture: rupture
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
    let filteredData = [...this.stocks];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(stock =>
        (stock.article?.designation && stock.article.designation.toLowerCase().includes(term)) ||
        (stock.article?.reference && stock.article.reference.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (this.selectedCategorie) {
      filteredData = filteredData.filter(stock =>
        stock.article?.categorie === this.selectedCategorie
      );
    }

    // Stock status filter
    if (this.selectedStatutStock) {
      filteredData = filteredData.filter(stock => {
        const qty = stock.quantite;
        const seuil = stock.article?.seuilAlerte || 0;

        switch (this.selectedStatutStock) {
          case 'EN_STOCK':
            return qty > seuil;
          case 'STOCK_FAIBLE':
            return qty > 0 && qty <= seuil;
          case 'RUPTURE':
            return qty === 0;
          default:
            return true;
        }
      });
    }

    this.dataSource.data = filteredData;
    this.totalItems = filteredData.length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategorie = '';
    this.selectedStatutStock = '';
    this.dataSource.data = this.stocks;
    this.totalItems = this.stocks.length;
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

  // Stock status helpers
  getStockStatusClass(stock: Stock): string {
    const qty = stock.quantite;
    const seuil = stock.article?.seuilAlerte || 0;

    if (qty === 0) return 'stock-out';
    if (qty <= seuil) return 'stock-low';
    return 'stock-ok';
  }

  getStockIcon(stock: Stock): string {
    const qty = stock.quantite;
    const seuil = stock.article?.seuilAlerte || 0;

    if (qty === 0) return 'error';
    if (qty <= seuil) return 'warning';
    return 'check_circle';
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'primary';
      case 'INACTIF': return 'warn';
      default: return 'accent';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'Actif';
      case 'INACTIF': return 'Inactif';
      default: return statut;
    }
  }

  // Image error handler
  onImageError(event: any): void {
    event.target.src = '/assets/images/no-image.png';
  }

  // Actions
  openArticleForm(): void {
    this.router.navigate(['/stock/articles/nouveau']);
  }

  viewArticle(stock: Stock): void {
    if (stock.article) {
      this.router.navigate(['/stock/articles', stock.article.id]);
    }
  }

  editArticle(stock: Stock): void {
    if (stock.article) {
      this.router.navigate(['/stock/articles', stock.article.id, 'modifier']);
    }
  }

  duplicateArticle(stock: Stock): void {
    // Implementation for duplicating article
    this.snackBar.open('Fonctionnalité de duplication en cours de développement', 'Fermer', { duration: 3000 });
  }

  adjustStock(stock: Stock): void {
    // Implementation for stock adjustment
    this.snackBar.open('Fonctionnalité d\'ajustement de stock en cours de développement', 'Fermer', { duration: 3000 });
  }

  viewMovements(stock: Stock): void {
    if (stock.article) {
      this.router.navigate(['/mouvements'], { queryParams: { articleId: stock.article.id } });
    }
  }

  deleteArticle(stock: Stock): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette entrée de stock pour "${stock.article?.designation}" ?`)) {
      this.stockService.delete(stock.id).subscribe({
        next: () => {
          this.snackBar.open('Entrée de stock supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadData();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  exportArticles(): void {
    // Implementation for export
    this.snackBar.open('Fonctionnalité d\'export en cours de développement', 'Fermer', { duration: 3000 });
  }
}
