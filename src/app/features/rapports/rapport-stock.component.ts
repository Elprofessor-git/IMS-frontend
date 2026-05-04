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
    
    // Récupérer les stocks réels depuis le service
    this.articleService.getAll().subscribe(articles => {
      // Récupérer tous les stocks pour ces articles
      const stocks: Stock[] = [];
      
      articles.forEach(article => {
        // Simuler un appel pour récupérer le stock de chaque article
        // Dans une implémentation réelle, vous auriez un endpoint dedicated
        const stock: Stock = {
          id: article.id,
          articleId: article.id,
          article: article,
          quantite: 0,
          quantiteReservee: 0,
          typeStock: 'Libre' as any, // TypeStock.Libre
          prixUnitaire: article.prixUnitaireMoyen || 0,
          dateEntree: new Date(),
          estValide: true,
          emplacementPhysique: 'DEF'
        };
        stocks.push(stock);
      });

      // Filtrer selon les critères sélectionnés
      let stocksFiltres = stocks;
      
      if (this.selectedCategorie) {
        stocksFiltres = stocksFiltres.filter(s => s.article?.categorie === this.selectedCategorie);
      }
      
      if (this.selectedEmplacement) {
        stocksFiltres = stocksFiltres.filter(s => s.emplacementPhysique === this.selectedEmplacement);
      }
      
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        stocksFiltres = stocksFiltres.filter(s => 
          s.article?.designation?.toLowerCase().includes(term) ||
          s.article?.reference?.toLowerCase().includes(term)
        );
      }

      // Calculer les statistiques
      const valeurTotale = stocksFiltres.reduce((acc, s) => {
        const prix = s.article?.prixUnitaireMoyen || 0;
        return acc + (s.quantite * prix);
      }, 0);
      
      const totalArticles = stocksFiltres.length;
      const quantiteTotale = stocksFiltres.reduce((acc, s) => acc + s.quantite, 0);
      
      const alertes = stocksFiltres.filter(s => {
        const seuil = s.article?.seuilAlerte || 0;
        return s.quantite <= seuil;
      }).length;

      this.rapportData = {
        valeurTotale,
        totalArticles,
        quantiteTotale,
        alertes,
        rotationMoyenne: 4.2, // TODO: Calculer depuis les mouvements
        mouvements: { entrees: 0, sorties: 0, transferts: 0, ajustements: 0 },
        mouvementsChart: {},
        rotation: { rapide: 0, normale: 0, lente: 0 },
        topArticles: [],
        previsions: [],
        alertesDetaillees: stocksFiltres
          .filter(s => s.quantite <= (s.article?.seuilAlerte || 0))
          .map(s => ({
            niveau: s.quantite === 0 ? 'critique' : 'warning',
            articleNom: s.article?.designation || 'N/A',
            type: s.quantite === 0 ? 'Rupture de stock' : 'Stock bas',
            dateDetection: new Date(),
            message: s.quantite === 0 ? 'Stock à 0' : `Stock: ${s.quantite}`,
            stockActuel: s.quantite,
            seuil: s.article?.seuilAlerte || 0,
            article: s.article
          }))
      };

      this.stockDataSource.data = stocksFiltres;
      this.isLoading = false;
    }, error => {
      this.error = 'Erreur lors du chargement des données de stock';
      this.isLoading = false;
      console.error(error);
    });
  }

  exportToPDF(): void {  }
  exportToExcel(): void {  }
  applyFilters(): void {  }
  refreshData(): void { this.generateReport(); }

  updateDisplayedColumns(): void {
    this.displayedColumns = this.availableColumns.filter(c => c.visible).map(c => c.id);
  }

  getStockStatusClass(item: Stock): string {
    if (!item || !item.article) return '';
    if (item.quantite === 0) return 'stock-out';
    if (item.quantite <= (item.article.seuilAlerte || 0)) return 'stock-low';
    return 'stock-ok';
  }

  getStockStatusLabel(item: Stock): string {
    if (!item || !item.article) return 'N/A';
    if (item.quantite === 0) return 'Rupture';
    if (item.quantite <= (item.article.seuilCritique || 0)) return 'Critique';
    if (item.quantite <= (item.article.seuilAlerte || 0)) return 'Bas';
    return 'Normal';
  }

  getRowClass(row: Stock): string {
    // Example row class logic
    return '';
  }

  viewArticleDetails(item: any): void {  }
  viewMovements(item: any): void {  }
  adjustStock(item: any): void {  }

  getAlertIcon(level: 'critique' | 'warning' | 'info'): string {
    switch (level) {
      case 'critique': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
    }
  }

  resolveAlert(alert: any): void {  }

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

