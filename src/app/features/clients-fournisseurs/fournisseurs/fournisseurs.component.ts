import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { FournisseurService } from '../../../core/services/fournisseur.service';
import { Fournisseur } from '../../../shared/models/common.model';

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './fournisseurs.component.html',
  styleUrls: ['./fournisseurs.component.scss']
})
export class FournisseursComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['nomEntreprise', 'personneContact', 'email', 'telephone', 'ville', 'statut', 'actions'];
  dataSource = new MatTableDataSource<Fournisseur>([]);

  loading = false;
  totalFournisseurs = 0;
  pageSize = 25;
  currentPage = 0;
  searchTerm = '';
  selectedStatus = '';

  statistics = { total: 0, active: 0, inactive: 0, newThisMonth: 0 };

  constructor(
    private fournisseurService: FournisseurService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFournisseurs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadFournisseurs(): void {
    this.loading = true;
    this.fournisseurService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (fournisseurs) => {
        this.dataSource.data = fournisseurs;
        this.totalFournisseurs = fournisseurs.length;
        this.calculateStatistics(fournisseurs);
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des fournisseurs', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculateStatistics(fournisseurs: Fournisseur[]): void {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    this.statistics = {
      total: fournisseurs.length,
      active: fournisseurs.filter(f => f.estActif).length,
      inactive: fournisseurs.filter(f => !f.estActif).length,
      newThisMonth: fournisseurs.filter(f => new Date(f.dateCreation) >= firstDayOfMonth).length
    };
  }

  onSearch(): void { this.currentPage = 0; this.loadFournisseurs(); }
  onFilterChange(): void { this.currentPage = 0; this.loadFournisseurs(); }
  clearFilters(): void { this.searchTerm = ''; this.selectedStatus = ''; this.loadFournisseurs(); }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  openNewFournisseurForm(): void {
    this.router.navigate(['/clients-fournisseurs/fournisseurs/nouveau']);
  }

  editFournisseur(fournisseur: Fournisseur): void {
    this.router.navigate(['/clients-fournisseurs/fournisseurs', fournisseur.id]);
  }

  deleteFournisseur(fournisseur: Fournisseur): void {
    if (confirm(`Supprimer ${fournisseur.nomEntreprise} ?`)) {
      this.fournisseurService.delete(fournisseur.id).subscribe({
        next: () => {
          this.snackBar.open('Fournisseur supprimé', 'Fermer', { duration: 3000 });
          this.loadFournisseurs();
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
      });
    }
  }

  toggleStatus(fournisseur: Fournisseur): void {
    this.fournisseurService.toggleStatus(fournisseur.id).subscribe({
      next: () => this.loadFournisseurs(),
      error: () => this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 })
    });
  }
}
