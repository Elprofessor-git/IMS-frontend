import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';

import { MouvementService, MouvementStock } from '../../core/services/mouvement.service';

@Component({
  selector: 'app-mouvement-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatExpansionModule
  ],
  template: `
    <div class="mouvement-details-container">
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement des détails...</p>
      </div>

      <div *ngIf="!loading && mouvement" class="details-content">
        <!-- En-tête avec actions -->
        <div class="header-section">
          <div class="header-info">
            <h1>
              <mat-icon>{{ getTypeIcon(mouvement.typeMouvement) }}</mat-icon>
              Mouvement {{ mouvement.id }} - {{ getTypeLabel(mouvement.typeMouvement) }}
            </h1>
            <div class="status-chip">
              <mat-chip [color]="getStatusColor(mouvement.statut)" selected>
                {{ getStatusLabel(mouvement.statut) }}
              </mat-chip>
            </div>
          </div>

          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="onEdit()">
              <mat-icon>edit</mat-icon>
              Modifier
            </button>
            <button mat-raised-button color="accent" (click)="onDuplicate()">
              <mat-icon>content_copy</mat-icon>
              Dupliquer
            </button>
            <button mat-raised-button color="warn" (click)="onDelete()">
              <mat-icon>delete</mat-icon>
              Supprimer
            </button>
          </div>
        </div>

        <!-- Informations générales -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Informations Générales</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Type de Mouvement :</span>
                <span class="value">
                  <mat-chip [color]="getTypeColor(mouvement.typeMouvement)" selected>
                    {{ getTypeLabel(mouvement.typeMouvement) }}
                  </mat-chip>
                </span>
              </div>

              <div class="info-item">
                <span class="label">Article :</span>
                <span class="value">{{ mouvement.article?.nom || 'N/A' }}</span>
              </div>

              <div class="info-item">
                <span class="label">Quantité :</span>
                <span class="value quantity">{{ mouvement.quantite }}</span>
              </div>

              <div class="info-item">
                <span class="label">Date de Mouvement :</span>
                <span class="value">{{ mouvement.dateMouvement | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="info-item">
                <span class="label">Motif :</span>
                <span class="value">{{ mouvement.motif }}</span>
              </div>

              <div class="info-item">
                <span class="label">Statut :</span>
                <span class="value">
                  <mat-chip [color]="getStatusColor(mouvement.statut)" selected>
                    {{ getStatusLabel(mouvement.statut) }}
                  </mat-chip>
                </span>
              </div>

              <div class="info-item" *ngIf="mouvement.referenceDocument">
                <span class="label">Référence Document :</span>
                <span class="value">{{ mouvement.referenceDocument }}</span>
              </div>

              <div class="info-item" *ngIf="mouvement.notes">
                <span class="label">Notes :</span>
                <span class="value">{{ mouvement.notes }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Emplacements -->
        <mat-card class="emplacements-card">
          <mat-card-header>
            <mat-card-title>Emplacements</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="emplacements-grid">
              <div class="emplacement-item" *ngIf="mouvement.emplacementSource">
                <div class="emplacement-header">
                  <mat-icon>location_on</mat-icon>
                  <h4>Emplacement Source</h4>
                </div>
                <div class="emplacement-details">
                  <p><strong>Nom :</strong> {{ mouvement.emplacementSource.nom }}</p>
                  <p><strong>Description :</strong> {{ mouvement.emplacementSource.description }}</p>
                  <p><strong>Type :</strong> {{ mouvement.emplacementSource.typeEmplacement }}</p>
                </div>
              </div>

              <div class="emplacement-item" *ngIf="mouvement.emplacementDestination">
                <div class="emplacement-header">
                  <mat-icon>location_on</mat-icon>
                  <h4>Emplacement Destination</h4>
                </div>
                <div class="emplacement-details">
                  <p><strong>Nom :</strong> {{ mouvement.emplacementDestination.nom }}</p>
                  <p><strong>Description :</strong> {{ mouvement.emplacementDestination.description }}</p>
                  <p><strong>Type :</strong> {{ mouvement.emplacementDestination.typeEmplacement }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Informations de l'article -->
        <mat-card class="article-card">
          <mat-card-header>
            <mat-card-title>Informations Article</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="article-info" *ngIf="mouvement.article">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Référence :</span>
                  <span class="value">{{ mouvement.article.reference }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Catégorie :</span>
                  <span class="value">{{ mouvement.article.categorie?.nom || 'N/A' }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Stock actuel :</span>
                  <span class="value">{{ mouvement.article.quantiteStock || 0 }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Stock minimum :</span>
                  <span class="value">{{ mouvement.article.stockMinimum || 0 }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Prix unitaire :</span>
                  <span class="value">{{ mouvement.article.prixUnitaire | currency:'EUR' }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Prix de vente :</span>
                  <span class="value">{{ mouvement.article.prixVente | currency:'EUR' }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Impact sur le stock -->
        <mat-card class="impact-card">
          <mat-card-header>
            <mat-card-title>Impact sur le Stock</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="impact-info">
              <div class="impact-item">
                <mat-icon [color]="getImpactColor()">{{ getImpactIcon() }}</mat-icon>
                <div class="impact-text">
                  <h4>{{ getImpactTitle() }}</h4>
                  <p>{{ getImpactDescription() }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Historique des mouvements -->
        <mat-card class="historique-card">
          <mat-card-header>
            <mat-card-title>Historique des Mouvements</mat-card-title>
            <mat-card-subtitle>Mouvements récents pour cet article</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>history</mat-icon>
                  Voir l'historique
                </mat-panel-title>
                <mat-panel-description>
                  {{ historiqueMouvements.length || 0 }} mouvement(s)
                </mat-panel-description>
              </mat-expansion-panel-header>

              <table mat-table [dataSource]="historiqueMouvements || []" class="historique-table">
                <!-- Date -->
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let mouvement">{{ mouvement.dateMouvement | date:'dd/MM/yyyy HH:mm' }}</td>
                </ng-container>

                <!-- Type -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let mouvement">
                    <mat-chip [color]="getTypeColor(mouvement.typeMouvement)" selected>
                      {{ getTypeLabel(mouvement.typeMouvement) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Quantité -->
                <ng-container matColumnDef="quantite">
                  <th mat-header-cell *matHeaderCellDef>Quantité</th>
                  <td mat-cell *matCellDef="let mouvement">{{ mouvement.quantite }}</td>
                </ng-container>

                <!-- Motif -->
                <ng-container matColumnDef="motif">
                  <th mat-header-cell *matHeaderCellDef>Motif</th>
                  <td mat-cell *matCellDef="let mouvement">{{ mouvement.motif }}</td>
                </ng-container>

                <!-- Statut -->
                <ng-container matColumnDef="statut">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let mouvement">
                    <mat-chip [color]="getStatusColor(mouvement.statut)" selected>
                      {{ getStatusLabel(mouvement.statut) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="historiqueColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: historiqueColumns;"></tr>
              </table>

              <div *ngIf="!historiqueMouvements || historiqueMouvements.length === 0" class="no-data">
                <mat-icon>history</mat-icon>
                <p>Aucun historique disponible</p>
              </div>
            </mat-expansion-panel>
          </mat-card-content>
        </mat-card>

        <!-- Résumé -->
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Résumé</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Créé le :</span>
                <span class="value">{{ mouvement.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="summary-item" *ngIf="mouvement.updatedAt">
                <span class="label">Modifié le :</span>
                <span class="value">{{ mouvement.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="summary-item">
                <span class="label">Utilisateur :</span>
                <span class="value">{{ mouvement.utilisateur?.nom || 'N/A' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Erreur -->
      <div *ngIf="!loading && !mouvement" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <h2>Mouvement non trouvé</h2>
        <p>Le mouvement demandé n'existe pas ou a été supprimé.</p>
        <button mat-raised-button color="primary" (click)="onBack()">
          <mat-icon>arrow_back</mat-icon>
          Retour à la liste
        </button>
      </div>
    </div>
  `,
  styles: [`
    .mouvement-details-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .header-info h1 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.8rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .info-card, .emplacements-card, .article-card, .impact-card, .historique-card, .summary-card {
      margin-bottom: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .info-item .label {
      font-weight: 500;
      color: #666;
      min-width: 150px;
    }

    .info-item .value {
      font-weight: 600;
      color: #333;
    }

    .info-item .value.quantity {
      color: #1976d2;
      font-size: 1.1em;
    }

    .emplacements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .emplacement-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      background-color: #fafafa;
    }

    .emplacement-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .emplacement-header h4 {
      margin: 0;
      color: #1976d2;
    }

    .emplacement-details p {
      margin: 4px 0;
      color: #666;
    }

    .impact-info {
      padding: 16px;
    }

    .impact-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .impact-item mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .impact-text h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .impact-text p {
      margin: 0;
      color: #666;
    }

    .historique-table {
      width: 100%;
      margin-top: 16px;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .summary-item .label {
      font-weight: 500;
      color: #666;
    }

    .summary-item .value {
      font-weight: 600;
      color: #1976d2;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px;
      text-align: center;
    }

    .error-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .error-container h2 {
      margin: 16px 0;
      color: #d32f2f;
    }

    .error-container p {
      margin-bottom: 24px;
      color: #666;
    }

    @media (max-width: 768px) {
      .header-section {
        flex-direction: column;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
        justify-content: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .emplacements-grid {
        grid-template-columns: 1fr;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MouvementDetailsComponent implements OnInit {
  mouvement: MouvementStock | null = null;
  loading = true;
  historiqueMouvements: MouvementStock[] = [];
  historiqueColumns: string[] = ['date', 'type', 'quantite', 'motif', 'statut'];

  constructor(
    private mouvementService: MouvementService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMouvement();
  }

  loadMouvement(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mouvementService.getById(+id).subscribe({
        next: (mouvement) => {
          this.mouvement = mouvement;
          this.loadHistorique();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du mouvement:', error);
          this.snackBar.open('Erreur lors du chargement du mouvement', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  loadHistorique(): void {
    if (this.mouvement?.articleId) {
      this.mouvementService.getHistoriqueArticle(this.mouvement.articleId).subscribe({
        next: (historique) => {
          this.historiqueMouvements = historique.slice(0, 10); // Limiter à 10 mouvements
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'historique:', error);
        }
      });
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'Entree': return 'input';
      case 'Sortie': return 'output';
      case 'Transfert': return 'swap_horiz';
      case 'Ajustement': return 'tune';
      default: return 'swap_horiz';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'Entree': return 'Entrée de Stock';
      case 'Sortie': return 'Sortie de Stock';
      case 'Transfert': return 'Transfert';
      case 'Ajustement': return 'Ajustement';
      default: return type;
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'Entree': return 'primary';
      case 'Sortie': return 'warn';
      case 'Transfert': return 'accent';
      case 'Ajustement': return 'primary';
      default: return 'primary';
    }
  }

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'EnAttente': return 'accent';
      case 'Valide': return 'primary';
      case 'Annule': return 'warn';
      default: return 'primary';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'EnAttente': return 'En Attente';
      case 'Valide': return 'Validé';
      case 'Annule': return 'Annulé';
      default: return statut;
    }
  }

  getImpactColor(): string {
    if (!this.mouvement) return 'primary';

    switch (this.mouvement.typeMouvement) {
      case 'Entree': return 'primary';
      case 'Sortie': return 'warn';
      case 'Transfert': return 'accent';
      case 'Ajustement': return 'primary';
      default: return 'primary';
    }
  }

  getImpactIcon(): string {
    if (!this.mouvement) return 'trending_up';

    switch (this.mouvement.typeMouvement) {
      case 'Entree': return 'trending_up';
      case 'Sortie': return 'trending_down';
      case 'Transfert': return 'swap_horiz';
      case 'Ajustement': return 'tune';
      default: return 'trending_up';
    }
  }

  getImpactTitle(): string {
    if (!this.mouvement) return 'Impact sur le stock';

    switch (this.mouvement.typeMouvement) {
      case 'Entree': return 'Augmentation du stock';
      case 'Sortie': return 'Diminution du stock';
      case 'Transfert': return 'Transfert entre emplacements';
      case 'Ajustement': return 'Ajustement du stock';
      default: return 'Impact sur le stock';
    }
  }

  getImpactDescription(): string {
    if (!this.mouvement) return '';

    switch (this.mouvement.typeMouvement) {
      case 'Entree':
        return `Le stock de ${this.mouvement.article?.nom} a été augmenté de ${this.mouvement.quantite} unités.`;
      case 'Sortie':
        return `Le stock de ${this.mouvement.article?.nom} a été diminué de ${this.mouvement.quantite} unités.`;
      case 'Transfert':
        return `${this.mouvement.quantite} unités de ${this.mouvement.article?.nom} ont été transférées.`;
      case 'Ajustement':
        return `Le stock de ${this.mouvement.article?.nom} a été ajusté de ${this.mouvement.quantite} unités.`;
      default:
        return '';
    }
  }

  onEdit(): void {
    if (this.mouvement?.id) {
      this.router.navigate(['/mouvements', this.mouvement.id, 'edit']);
    }
  }

  onDuplicate(): void {
    if (this.mouvement) {
      // Logique de duplication
      this.snackBar.open('Fonctionnalité de duplication en cours de développement', 'Fermer', { duration: 2000 });
    }
  }

  onDelete(): void {
    if (this.mouvement?.id) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce mouvement ?')) {
        this.mouvementService.delete(this.mouvement.id).subscribe({
          next: () => {
            this.snackBar.open('Mouvement supprimé avec succès', 'Fermer', { duration: 3000 });
            this.router.navigate(['/mouvements']);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    }
  }

  onBack(): void {
    this.router.navigate(['/mouvements']);
  }
}


