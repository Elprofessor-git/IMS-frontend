import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StockService, Article, StockSummary, StockFilters, PaginatedResponse } from '../../core/services/stock.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatExpansionModule,
    MatDividerModule
  ],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Table configuration
  displayedColumns: string[] = ['select', 'image', 'nom', 'categorie', 'quantite', 'prix', 'statut', 'actions'];
  dataSource = new MatTableDataSource<Article>([]);
  selection = new SelectionModel<Article>(true, []);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Component state
  loading = false;
  error: string | null = null;
  stockSummary: StockSummary | null = null;
  categories: string[] = [];
  
  // Search and filters
  searchTerm = '';
  selectedCategory = '';
  showAdvancedFilters = false;
  filters: StockFilters = {};
  
  // Pagination
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;

  constructor(
    private stockService: StockService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.filters.search = term;
      this.loadArticles();
    });
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeComponent(): Promise<void> {
    try {
      // Load initial data
      await Promise.all([
        this.loadArticles(),
        this.loadStockSummary(),
        this.loadCategories()
      ]);
      
      // Setup table
      this.setupTable();
    } catch (error) {
      this.handleError('Erreur lors du chargement des données', error);
    }
  }

  private setupTable(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  // Data loading methods
  async loadArticles(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      
      const response = await this.stockService.getArticles(
        this.filters,
        this.currentPage + 1,
        this.pageSize
      ).toPromise();
      
      if (response) {
        this.dataSource.data = response.data;
        this.totalItems = response.total;
      }
    } catch (error) {
      this.handleError('Erreur lors du chargement des articles', error);
    } finally {
      this.loading = false;
    }
  }

  async loadStockSummary(): Promise<void> {
    try {
      this.stockSummary = await this.stockService.getStockSummary().toPromise() || null;
    } catch (error) {
      console.error('Erreur lors du chargement du résumé stock:', error);
    }
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await this.stockService.getCategories().toPromise() || [];
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  }

  // Search and filter methods
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onCategoryChange(): void {
    this.filters.category = this.selectedCategory;
    this.loadArticles();
  }

  applyFilters(): void {
    this.loadArticles();
  }

  clearFilters(): void {
    this.filters = {};
    this.searchTerm = '';
    this.selectedCategory = '';
    this.loadArticles();
  }

  // Table selection methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  selectRow(row: Article): void {
    this.selection.toggle(row);
  }

  // Article management methods
  openAddDialog(): void {
    // TODO: Implement add article dialog
    this.snackBar.open('Fonctionnalité en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  viewDetails(article: Article): void {
    // TODO: Implement view details
    this.snackBar.open(`Détails de ${article.nom}`, 'Fermer', {
      duration: 3000
    });
  }

  editItem(article: Article): void {
    // TODO: Implement edit dialog
    this.snackBar.open(`Édition de ${article.nom}`, 'Fermer', {
      duration: 3000
    });
  }

  async adjustStock(article: Article): Promise<void> {
    // TODO: Implement stock adjustment dialog
    this.snackBar.open(`Ajustement stock pour ${article.nom}`, 'Fermer', {
      duration: 3000
    });
  }

  async deleteItem(article: Article): Promise<void> {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${article.nom} ?`)) {
      try {
        await this.stockService.deleteArticle(article.id).toPromise();
        this.snackBar.open('Article supprimé avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadArticles();
      } catch (error) {
        this.handleError('Erreur lors de la suppression', error);
      }
    }
  }

  // Bulk operations
  async bulkDelete(): Promise<void> {
    const selectedIds = this.selection.selected.map(item => item.id);
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} article(s) ?`)) {
      try {
        await this.stockService.bulkDelete(selectedIds).toPromise();
        this.snackBar.open(`${selectedIds.length} article(s) supprimé(s)`, 'Fermer', {
          duration: 3000
        });
        this.selection.clear();
        this.loadArticles();
      } catch (error) {
        this.handleError('Erreur lors de la suppression en lot', error);
      }
    }
  }

  bulkEdit(): void {
    // TODO: Implement bulk edit
    this.snackBar.open('Modification en lot en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  async bulkExport(): Promise<void> {
    try {
      const selectedIds = this.selection.selected.map(item => item.id);
      // TODO: Add selected IDs to export filters
      const blob = await this.stockService.exportArticles(this.filters).toPromise();
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `articles_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      this.handleError('Erreur lors de l\'export', error);
    }
  }

  // Utility methods
  async exportData(): Promise<void> {
    try {
      const blob = await this.stockService.exportArticles(this.filters).toPromise();
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Export terminé', 'Fermer', {
          duration: 3000
        });
      }
    } catch (error) {
      this.handleError('Erreur lors de l\'export', error);
    }
  }

  importData(): void {
    // TODO: Implement import dialog
    this.snackBar.open('Import en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  generateReport(): void {
    // TODO: Implement report generation
    this.snackBar.open('Génération de rapport en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  refreshData(): void {
    this.loadArticles();
    this.loadStockSummary();
    this.snackBar.open('Données actualisées', 'Fermer', {
      duration: 2000
    });
  }

  // Status and display methods
  getStatusClass(article: Article): string {
    if (article.quantite === 0) return 'status-out';
    if (article.quantite <= article.seuilMinimum) return 'status-low';
    return 'status-active';
  }

  getStatusText(article: Article): string {
    if (article.quantite === 0) return 'Rupture';
    if (article.quantite <= article.seuilMinimum) return 'Stock faible';
    return 'Disponible';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/no-image.png';
  }

  // Error handling
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.error = message;
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
