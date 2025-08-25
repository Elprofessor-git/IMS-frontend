import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { RapportService } from '../../core/services/rapport.service';
import { EmplacementService } from '../../core/services/emplacement.service';
import { ArticleService } from '../../core/services/article.service';
import { Stock } from '../../shared/models/stock.model';

@Component({
  selector: 'app-rapport-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatMenuModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './rapport-stock.component.html',
  styleUrls: ['./rapport-stock.component.scss']
})
export class RapportStockComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Properties for date range
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  // Main data object for the report
  rapportData: any | null = null;

  // Filters
  selectedCategorie = '';
  categories: string[] = [];
  selectedEmplacement = '';
  emplacements: any[] = [];
  selectedStatut = '';
  searchTerm = '';

  // Tab control
  selectedTabIndex = 0;

  // Table configuration
  stockDataSource = new MatTableDataSource<Stock>([]);
  availableColumns = [
    { id: 'article', label: 'Article', visible: true },
    { id: 'quantite', label: 'Quantité', visible: true },
    { id: 'seuil', label: 'Seuil Min.', visible: false },
    { id: 'valeur', label: 'Valeur', visible: true },
    { id: 'emplacement', label: 'Emplacement', visible: true },
    { id: 'derniereMaj', label: 'Dernière MAJ', visible: false },
    { id: 'statut', label: 'Statut', visible: true },
    { id: 'actions', label: 'Actions', visible: true }
  ];
  displayedColumns: string[] = this.availableColumns.filter(c => c.visible).map(c => c.id);

  // State management
  isLoading = false;
  error: string | null = null;

  constructor(
    private rapportService: RapportService,
    private emplacementService: EmplacementService,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    // Load filter data
    this.articleService.getCategories().subscribe(cats => this.categories = cats);
    this.emplacementService.getAll().subscribe(emps => this.emplacements = emps);

    // Generate a default report for the last 30 days
    this.dateFin = new Date();
    this.dateDebut = new Date();
    this.dateDebut.setDate(this.dateFin.getDate() - 30);
    this.generateReport();
  }

  generateReport(): void {
    if (!this.dateDebut || !this.dateFin) {
      return;
    }
    this.isLoading = true;
    this.error = null;
    console.log('Generating report for period:', this.dateDebut, 'to', this.dateFin);
    // Mock data for now to make template compile
    setTimeout(() => {
      this.rapportData = this.getMockRapportData();
      this.stockDataSource.data = []; // You would populate this from rapportData
      this.isLoading = false;
    }, 1000);
  }

  exportToPDF(): void { console.log('Exporting to PDF...'); }
  exportToExcel(): void { console.log('Exporting to Excel...'); }
  applyFilters(): void { console.log('Applying filters...'); }
  refreshData(): void { this.generateReport(); }

  updateDisplayedColumns(): void {
    this.displayedColumns = this.availableColumns.filter(c => c.visible).map(c => c.id);
  }

  getStockStatusClass(item: Stock): string {
    if (!item || !item.article) return '';
    if (item.quantite === 0) return 'stock-out';
    if (item.quantite <= item.article.seuilAlerte) return 'stock-low';
    return 'stock-ok';
  }

  getStockStatusLabel(item: Stock): string {
    if (!item || !item.article) return 'N/A';
    if (item.quantite === 0) return 'Rupture';
    if (item.quantite <= item.article.seuilCritique) return 'Critique';
    if (item.quantite <= item.article.seuilAlerte) return 'Bas';
    return 'Normal';
  }

  getRowClass(row: Stock): string {
    // Example row class logic
    return '';
  }

  viewArticleDetails(item: any): void { console.log('View details for:', item); }
  viewMovements(item: any): void { console.log('View movements for:', item); }
  adjustStock(item: any): void { console.log('Adjust stock for:', item); }

  getAlertIcon(level: 'critique' | 'warning' | 'info'): string {
    switch (level) {
      case 'critique': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
    }
  }

  resolveAlert(alert: any): void { console.log('Resolving alert:', alert); }

  private getMockRapportData(): any {
    return {
      valeurTotale: 125030.50,
      totalArticles: 150,
      quantiteTotale: 8500,
      alertes: 12,
      rotationMoyenne: 4.2,
      mouvements: { entrees: 500, sorties: 450, transferts: 120, ajustements: 15 },
      mouvementsChart: {},
      rotation: { rapide: 25, normale: 80, lente: 45 },
      topArticles: [{ nom: 'Tissu Coton Bleu', reference: 'TCB-001', quantiteVendue: 500, chiffreAffaires: 12500 }],
      previsions: [{ articleNom: 'Fermeture Éclair 20cm', reference: 'FE-20', datePrevisionnelle: new Date(), quantiteRecommandee: 200, unite: 'pcs' }],
      alertesDetaillees: [{ niveau: 'critique', articleNom: 'Bouton Nacre', type: 'Rupture de stock', dateDetection: new Date(), message: 'Stock à 0 depuis 2 jours.', stockActuel: 0, seuil: 50, article: {} }]
    };
  }
}