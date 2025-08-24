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

import { StockService, Article } from '../../core/services/stock.service';

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
  dataSource = new MatTableDataSource<Article>([]);

  // Pagination
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;

  // Filters
  searchTerm = '';
  selectedCategorie = '';
  selectedStatutStock = '';

  // Data
  articles: Article[] = [];
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
      next: (articles) => {
        this.articles = articles;
        this.dataSource.data = articles;
        this.totalItems = articles.length;
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
    const total = this.articles.length;
    const enStock = this.articles.filter(a => (a.quantite || 0) > (a.seuilMinimum || 10)).length;
    const stockFaible = this.articles.filter(a => {
      const qty = a.quantite || 0;
      const seuil = a.seuilMinimum || 10;
      return qty > 0 && qty <= seuil;
    }).length;
    const rupture = this.articles.filter(a => (a.quantite || 0) === 0).length;

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
    let filteredData = [...this.articles];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(article =>
        article.nom.toLowerCase().includes(term) ||
        article.reference.toLowerCase().includes(term) ||
        (article.codeBarres && article.codeBarres.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (this.selectedCategorie) {
      filteredData = filteredData.filter(article =>
        article.categorie === this.selectedCategorie
      );
    }

    // Stock status filter
    if (this.selectedStatutStock) {
      filteredData = filteredData.filter(article => {
        const qty = article.quantite || 0;
        const seuil = article.seuilMinimum || 10;

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
    this.dataSource.data = this.articles;
    this.totalItems = this.articles.length;
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
  getStockStatusClass(article: Article): string {
    const qty = article.quantite || 0;
    const seuil = article.seuilMinimum || 10;

    if (qty === 0) return 'stock-out';
    if (qty <= seuil) return 'stock-low';
    return 'stock-ok';
  }

  getStockIcon(article: Article): string {
    const qty = article.quantite || 0;
    const seuil = article.seuilMinimum || 10;

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

  viewArticle(article: Article): void {
    this.router.navigate(['/stock/articles', article.id]);
  }

  editArticle(article: Article): void {
    this.router.navigate(['/stock/articles', article.id, 'modifier']);
  }

  duplicateArticle(article: Article): void {
    // Implementation for duplicating article
    this.snackBar.open('Fonctionnalité de duplication en cours de développement', 'Fermer', { duration: 3000 });
  }

  adjustStock(article: Article): void {
    // Implementation for stock adjustment
    this.snackBar.open('Fonctionnalité d\'ajustement de stock en cours de développement', 'Fermer', { duration: 3000 });
  }

  viewMovements(article: Article): void {
    this.router.navigate(['/mouvements'], { queryParams: { articleId: article.id } });
  }

  deleteArticle(article: Article): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.nom}" ?`)) {
      this.stockService.delete(article.id!).subscribe({
        next: () => {
          this.snackBar.open('Article supprimé avec succès', 'Fermer', { duration: 3000 });
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
