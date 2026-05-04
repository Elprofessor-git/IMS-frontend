import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { MouvementService } from '../../core/services/mouvement.service';
import { ArticleService } from '../../core/services/article.service';
import { EmplacementService } from '../../core/services/emplacement.service';

interface IConsommationData {
  totalConsommation: number;
  totalMouvements: number;
  valeurTotale: number;
  articlesLesPlusUtilises: IArticleConso[];
}

interface IArticleConso {
  articleId: number;
  nom: string;
  quantiteConsommee: number;
  valeurConsommee: number;
  dernierMouvement: Date;
}

interface IMouvementTable {
  date: Date;
  article: string;
  quantite: number;
  source: string;
  destination: string;
  type: string;
  valeur: number;
}

@Component({
  selector: 'app-rapport-ventes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './rapport-ventes.component.html',
  styleUrls: ['./rapport-ventes.component.scss']
})
export class RapportVentesComponent implements OnInit {
  displayedColumns: string[] = ['date', 'article', 'quantite', 'source', 'destination', 'type', 'valeur'];
  mouvementsDataSource = new MatTableDataSource<IMouvementTable>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dateDebut: Date | null = null;
  dateFin: Date | null = null;
  
  consoData: IConsommationData | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private mouvementService: MouvementService,
    private articleService: ArticleService,
    private emplacementService: EmplacementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.dateFin = new Date();
    this.dateDebut = new Date();
    this.dateDebut.setDate(this.dateFin.getDate() - 30);
    this.generateReport();
  }

  generateReport(): void {
    if (!this.dateDebut || !this.dateFin) return;
    
    this.isLoading = true;
    this.error = null;

    this.mouvementService.getAll().subscribe((mouvements: any[]) => {
      const mouvementsFiltres = mouvements.filter((m: any) => {
        const dateMouv = new Date(m.dateMouvement);
        return dateMouv >= this.dateDebut! && dateMouv <= this.dateFin!;
      });

      let valeurTotale = 0;
      const articlesMap = new Map<number, IArticleConso>();

      mouvementsFiltres.forEach((mouv: any) => {
        this.articleService.getById(mouv.articleId).subscribe(article => {
          const quantite = mouv.quantite;
          const prixUnitaire = article.prixUnitaireMoyen || 0;
          const ligneValeur = quantite * prixUnitaire;
          valeurTotale += ligneValeur;

          const existing = articlesMap.get(article.id) || {
            articleId: article.id,
            nom: article.designation,
            quantiteConsommee: 0,
            valeurConsommee: 0,
            dernierMouvement: new Date(0)
          };
          existing.quantiteConsommee += quantite;
          existing.valeurConsommee += ligneValeur;
          if (new Date(mouv.dateMouvement) > existing.dernierMouvement) {
            existing.dernierMouvement = new Date(mouv.dateMouvement);
          }
          articlesMap.set(article.id, existing);
        });
      });

      const topArticles: IArticleConso[] = Array.from(articlesMap.values())
        .sort((a, b) => b.valeurConsommee - a.valeurConsommee)
        .slice(0, 10);

      const tableData: IMouvementTable[] = mouvementsFiltres.map((mouv: any) => ({
        date: new Date(mouv.dateMouvement),
        article: '',
        quantite: mouv.quantite,
        source: mouv.emplacementSource?.nom || 'N/A',
        destination: mouv.emplacementDestination?.nom || 'N/A',
        type: mouv.typeMouvement,
        valeur: 0
      }));

      Promise.all(tableData.map(row => 
        this.articleService.getById(mouvements.find((m: any) => m.id === row.quantite)?.articleId || 0).toPromise()
      )).then(articles => {
        articles.forEach((article, index) => {
          if (article) {
            tableData[index].article = article.designation;
            tableData[index].valeur = tableData[index].quantite * (article.prixUnitaireMoyen || 0);
          }
        });
        
        this.consoData = {
          totalConsommation: topArticles.reduce((sum, art) => sum + art.quantiteConsommee, 0),
          totalMouvements: mouvementsFiltres.length,
          valeurTotale: valeurTotale,
          articlesLesPlusUtilises: topArticles
        };

        this.mouvementsDataSource.data = tableData;
        this.mouvementsDataSource.paginator = this.paginator;
        this.mouvementsDataSource.sort = this.sort;
        this.isLoading = false;
      }).catch(() => {
        this.mouvementsDataSource.data = tableData;
        this.isLoading = false;
      });

    }, (error: any) => {
      this.error = 'Erreur lors du chargement des données de consommation';
      this.isLoading = false;
      console.error(error);
      this.snackBar.open('Erreur de chargement des données', 'Fermer', { duration: 3000 });
    });
  }

  exportToPDF(): void { 
    this.snackBar.open('Export PDF non implémenté', 'Fermer', { duration: 2000 });
  }
  
  exportToExcel(): void { 
    this.snackBar.open('Export Excel non implémenté', 'Fermer', { duration: 2000 });
  }
  
  applyFilters(): void { this.generateReport(); }
  
  refreshData(): void { 
    this.generateReport();
    this.snackBar.open('Données actualisées', 'Fermer', { duration: 2000 });
  }
}
