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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StockService, Stock, Article } from '../../core/services/stock.service';
import { AuthService } from '../../core/services/auth.service';
import { StockFormComponent } from './stock-form.component';
import { StockAdjustmentDialogComponent } from './stock-adjustment-dialog.component';
import { StockDetailsDialogComponent } from './stock-details-dialog.component';

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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
  ],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Updated for Stock model
  displayedColumns: string[] = ['select', 'article', 'couleur', 'taille', 'quantite', 'emplacement', 'actions'];
  dataSource = new MatTableDataSource<Stock>([]);
  selection = new SelectionModel<Stock>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = false;
  error: string | null = null;
  articles: Article[] = [];

  constructor(
    private stockService: StockService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStocks();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStocks(): void {
    this.loading = true;
    this.error = null;
    this.stockService.getStocks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stocks) => {
          this.dataSource.data = stocks;
          // Create a unique list of articles from the stocks
          const articlesMap = new Map<number, Article>();
          stocks.forEach(stock => {
            if (stock.article) {
              articlesMap.set(stock.article.id, stock.article);
            }
          });
          this.articles = Array.from(articlesMap.values());
          this.loading = false;
        },
        error: (err) => {
          this.handleError('Erreur lors du chargement du stock', err);
          this.loading = false;
        }
      });
  }

  // --- Selection Logic ---
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

  // --- Dialogs and Actions ---

  openAddStockDialog(): void {
    const dialogRef = this.dialog.open(StockFormComponent, {
      width: '800px',
      data: {
        stock: null,
        articles: this.articles
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStocks();
      }
    });
  }

  editStock(stock: Stock): void {
    const dialogRef = this.dialog.open(StockFormComponent, {
      width: '800px',
      data: {
        stock: stock,
        articles: this.articles
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStocks();
      }
    });
  }

  viewDetails(stock: Stock): void {
    this.dialog.open(StockDetailsDialogComponent, {
      width: '600px',
      data: { stock: stock }
    });
  }

  deleteStock(stock: Stock): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le stock pour ${stock.article?.designation} ?`)) {
      this.stockService.deleteStock(stock.id).subscribe({
        next: () => {
          this.snackBar.open('Stock supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadStocks();
        },
        error: (err) => this.handleError('Erreur lors de la suppression', err)
      });
    }
  }

  adjustStock(stock: Stock): void {
    const dialogRef = this.dialog.open(StockAdjustmentDialogComponent, {
      width: '400px',
      data: { stock: stock }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStocks();
      }
    });
  }

  // --- Utility ---
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.error = message;
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
