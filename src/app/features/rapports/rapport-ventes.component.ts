import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { RapportService } from '../../core/services/rapport.service';
import { CommandeClientService } from '../commandes/commande-client.service';
import { ArticleService } from '../../core/services/article.service';

interface IVentesData {
  chiffreAffaires: number;
  totalCommandes: number;
  panierMoyen: number;
  croissance: number;
  topProduits: ITopProduit[];
}

interface ITopProduit {
  position: number;
  nom: string;
  quantite: number;
  ca: number;
  evolution: number;
}

@Component({
  selector: 'app-rapport-ventes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './rapport-ventes.component.html',
  styleUrls: ['./rapport-ventes.component.scss']
})
export class RapportVentesComponent implements OnInit {
  colonnesProduits: string[] = ['position', 'produit', 'quantite', 'ca', 'evolution'];
  topProduitsDataSource = new MatTableDataSource<ITopProduit>([]);
  
  dateDebut: Date | null = null;
  dateFin: Date | null = null;
  
  ventesData: IVentesData | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private rapportService: RapportService,
    private commandeService: CommandeClientService,
    private articleService: ArticleService
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

    this.commandeService.getCommandes().subscribe(commandes => {
      const commandesFiltrees = commandes.filter(c => {
        const dateCmd = new Date(c.dateCreation);
        return dateCmd >= this.dateDebut! && dateCmd <= this.dateFin!;
      });

      let caTotal = 0;
      const articlesMap = new Map<number, { nom: string, quantite: number, ca: number }>();

      commandesFiltrees.forEach(cmd => {
        cmd.specifications?.article?.forEach(spec => {
          const articleId = spec.article.id;
          const quantite = spec.quantite;
          
          this.articleService.getById(articleId).subscribe(article => {
            const prixUnitaire = article.prixVente || article.prixAchat || 0;
            const ligneCA = quantite * prixUnitaire;
            caTotal += ligneCA;

            const existing = articlesMap.get(articleId) || { nom: article.nom, quantite: 0, ca: 0 };
            existing.quantite += quantite;
            existing.ca += ligneCA;
            articlesMap.set(articleId, existing);
          });
        });
      });

      const topProduits: ITopProduit[] = Array.from(articlesMap.entries())
        .map(([id, data], index) => ({
          position: index + 1,
          nom: data.nom,
          quantite: data.quantite,
          ca: data.ca,
          evolution: Math.floor(Math.random() * 30) - 10
        }))
        .sort((a, b) => b.ca - a.ca)
        .slice(0, 10);

      const panierMoyen = commandesFiltrees.length > 0 ? caTotal / commandesFiltrees.length : 0;

      this.ventesData = {
        chiffreAffaires: caTotal,
        totalCommandes: commandesFiltrees.length,
        panierMoyen: panierMoyen,
        croissance: 15,
        topProduits: topProduits
      };

      this.topProduitsDataSource.data = topProduits;
      this.isLoading = false;
    }, error => {
      this.error = 'Erreur lors du chargement des données de ventes';
      this.isLoading = false;
      console.error(error);
    });
  }

  exportToPDF(): void { console.log('Export PDF'); }
  exportToExcel(): void { console.log('Export Excel'); }
  applyFilters(): void { this.generateReport(); }
  refreshData(): void { this.generateReport(); }
}
