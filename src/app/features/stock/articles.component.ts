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

import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../shared/models/stock.model';

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
  displayedColumns: string[] = ['image', 'designation', 'reference', 'categorie', 'prix', 'statut', 'actions'];
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
    private articleService: ArticleService,
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
    this.articleService.getAll().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.dataSource.data = articles;
        this.totalItems = articles.length;
        this.calculateStats();
        this.extractCategories();
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
    const actifs = this.articles.filter(a => a.estActif).length;
    const alertes = this.articles.filter(a => a.seuilAlerte && a.seuilAlerte > 0).length;
    const critiques = this.articles.filter(a => a.seuilCritique && a.seuilCritique > 0).length;

    this.stats = {
      totalArticles: total,
      articlesEnStock: actifs,
      articlesStockFaible: alertes,
      articlesRupture: critiques
    };
  }

  extractCategories(): void {
    const categoriesSet = new Set<string>();
    this.articles.forEach(article => {
      if (article.categorie) {
        categoriesSet.add(article.categorie);
      }
    });
    
    this.categories = Array.from(categoriesSet).map((cat, index) => ({
      id: index + 1,
      nom: cat
    }));
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
        (article.designation && article.designation.toLowerCase().includes(term)) ||
        (article.reference && article.reference.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (this.selectedCategorie) {
      filteredData = filteredData.filter(article =>
        article.categorie === this.selectedCategorie
      );
    }

    // Status filter (based on article status)
    if (this.selectedStatutStock) {
      filteredData = filteredData.filter(article => {
        switch (this.selectedStatutStock) {
          case 'ACTIF':
            return article.estActif;
          case 'INACTIF':
            return !article.estActif;
          case 'AVEC_SEUIL':
            return article.seuilAlerte && article.seuilAlerte > 0;
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

  // Article status helpers
  getArticleStatusClass(article: Article): string {
    if (!article.estActif) return 'article-inactive';
    if (article.seuilCritique && article.seuilCritique > 0) return 'article-critical';
    if (article.seuilAlerte && article.seuilAlerte > 0) return 'article-warning';
    return 'article-ok';
  }

  getArticleIcon(article: Article): string {
    if (!article.estActif) return 'block';
    if (article.seuilCritique && article.seuilCritique > 0) return 'error';
    if (article.seuilAlerte && article.seuilAlerte > 0) return 'warning';
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
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.designation}" ?`)) {
      this.articleService.delete(article.id).subscribe({
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


