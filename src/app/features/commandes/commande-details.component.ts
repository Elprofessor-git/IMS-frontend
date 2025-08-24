import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-commande-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Détails de la Commande #{{ commande.numeroCommande }}</mat-card-title>
        <mat-card-subtitle>{{ commande.titreCommande }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="details-grid">
          <div class="detail-item">
            <strong>Client:</strong>
            <span>{{ commande.client }}</span>
          </div>

          <div class="detail-item">
            <strong>Date de commande:</strong>
            <span>{{ commande.dateCommande | date:'dd/MM/yyyy' }}</span>
          </div>

          <div class="detail-item">
            <strong>Date de livraison prévue:</strong>
            <span>{{ commande.dateLivraisonPrevue | date:'dd/MM/yyyy' }}</span>
          </div>

          <div class="detail-item">
            <strong>Statut:</strong>
            <mat-chip [color]="getStatusColor(commande.statut)" selected>
              {{ getStatusLabel(commande.statut) }}
            </mat-chip>
          </div>
        </div>

        <mat-divider class="divider"></mat-divider>

        <div class="section">
          <h3>Articles commandés</h3>
          <div class="articles-list">
            <mat-card *ngFor="let article of commande.articles" class="article-card">
              <mat-card-content>
                <div class="article-info">
                  <span class="article-name">{{ article.nom }}</span>
                  <span class="article-quantity">Quantité: {{ article.quantite }}</span>
                  <span class="article-price">Prix unitaire: {{ article.prixUnitaire | currency:'EUR' }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <mat-divider class="divider"></mat-divider>

        <div class="section">
          <h3>Total</h3>
          <div class="total-info">
            <span class="total-amount">{{ getTotal() | currency:'EUR' }}</span>
          </div>
        </div>

        <div class="section" *ngIf="commande.notes">
          <h3>Notes</h3>
          <p>{{ commande.notes }}</p>
        </div>
      </mat-card-content>

      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="editCommande()">
          <mat-icon>edit</mat-icon>
          Modifier
        </button>
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Retour
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 800px;
      margin: 20px auto;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-item strong {
      color: #666;
      font-size: 0.9em;
    }

    .divider {
      margin: 20px 0;
    }

    .section {
      margin-bottom: 20px;
    }

    .section h3 {
      margin-bottom: 12px;
      color: #333;
    }

    .articles-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .article-card {
      background-color: #f5f5f5;
    }

    .article-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .article-name {
      font-weight: 500;
      flex: 1;
    }

    .total-info {
      text-align: right;
    }

    .total-amount {
      font-size: 1.5em;
      font-weight: bold;
      color: #2196f3;
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class CommandeDetailsComponent implements OnInit {
  commande: any = {
    id: 1,
    numeroCommande: 'CMD-2024-001',
    titreCommande: 'Commande textile printemps',
    client: 'Client A',
    dateCommande: new Date('2024-01-15'),
    dateLivraisonPrevue: new Date('2024-02-15'),
    statut: 'EnCours',
    notes: 'Commande urgente pour la collection printemps',
    articles: [
      { nom: 'Tissu coton bio', quantite: 100, prixUnitaire: 15.50 },
      { nom: 'Boutons nacre', quantite: 500, prixUnitaire: 0.75 },
      { nom: 'Fil polyester', quantite: 50, prixUnitaire: 8.20 }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    // Ici, vous chargeriez les détails de la commande depuis le service
    console.log('Chargement de la commande ID:', id);
  }

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'EnAttente': return 'accent';
      case 'EnCours': return 'primary';
      case 'Terminee': return 'primary';
      case 'Annulee': return 'warn';
      default: return 'primary';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'EnAttente': return 'En Attente';
      case 'EnCours': return 'En Cours';
      case 'Terminee': return 'Terminée';
      case 'Annulee': return 'Annulée';
      default: return statut;
    }
  }

  getTotal(): number {
    return this.commande.articles.reduce((total: number, article: any) =>
      total + (article.quantite * article.prixUnitaire), 0);
  }

  editCommande() {
    this.router.navigate(['/commandes/edit', this.commande.id]);
  }

  goBack() {
    this.router.navigate(['/commandes']);
  }
}
