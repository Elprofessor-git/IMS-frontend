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

import { ImportationService, Importation } from '../../core/services/importation.service';

@Component({
  selector: 'app-importation-details',
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
    MatDialogModule
  ],
  template: `
    <div class="importation-details-container">
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement des détails...</p>
      </div>

      <div *ngIf="!loading && importation" class="details-content">
        <!-- En-tête avec actions -->
        <div class="header-section">
          <div class="header-info">
            <h1>
              <mat-icon>flight_land</mat-icon>
              Importation {{ importation.referenceImportation }}
            </h1>
            <div class="status-chip">
              <mat-chip [color]="getStatusColor(importation.statut)" selected>
                {{ getStatusLabel(importation.statut) }}
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
                <span class="label">Référence :</span>
                <span class="value">{{ importation.referenceImportation }}</span>
              </div>

              <div class="info-item">
                <span class="label">Fournisseur :</span>
                <span class="value">{{ importation.fournisseur?.nom || 'N/A' }}</span>
              </div>

              <div class="info-item">
                <span class="label">Date d'Importation :</span>
                <span class="value">{{ importation.dateImportation | date:'dd/MM/yyyy' }}</span>
              </div>

              <div class="info-item">
                <span class="label">Mode d'Expédition :</span>
                <span class="value">{{ importation.modeExpedition }}</span>
              </div>

              <div class="info-item">
                <span class="label">Statut :</span>
                <span class="value">
                  <mat-chip [color]="getStatusColor(importation.statut)" selected>
                    {{ getStatusLabel(importation.statut) }}
                  </mat-chip>
                </span>
              </div>

              <div class="info-item">
                <span class="label">Montant Total :</span>
                <span class="value amount">{{ importation.montantTotal | currency:'EUR' }}</span>
              </div>

              <div class="info-item full-width" *ngIf="importation.notes">
                <span class="label">Notes :</span>
                <span class="value">{{ importation.notes }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Lignes d'importation -->
        <mat-card class="lignes-card">
          <mat-card-header>
            <mat-card-title>Articles Importés</mat-card-title>
            <mat-card-subtitle>{{ importation.lignesImportation?.length || 0 }} article(s)</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="importation.lignesImportation || []" class="lignes-table">
              <!-- Article -->
              <ng-container matColumnDef="article">
                <th mat-header-cell *matHeaderCellDef>Article</th>
                <td mat-cell *matCellDef="let ligne">{{ ligne.article?.nom || 'N/A' }}</td>
              </ng-container>

              <!-- Quantité -->
              <ng-container matColumnDef="quantite">
                <th mat-header-cell *matHeaderCellDef>Quantité</th>
                <td mat-cell *matCellDef="let ligne">{{ ligne.quantite }}</td>
              </ng-container>

              <!-- Prix Unitaire -->
              <ng-container matColumnDef="prixUnitaire">
                <th mat-header-cell *matHeaderCellDef>Prix Unitaire</th>
                <td mat-cell *matCellDef="let ligne">{{ ligne.prixUnitaire | currency:'EUR' }}</td>
              </ng-container>

              <!-- Montant Ligne -->
              <ng-container matColumnDef="montantLigne">
                <th mat-header-cell *matHeaderCellDef>Montant</th>
                <td mat-cell *matCellDef="let ligne">{{ ligne.montantLigne | currency:'EUR' }}</td>
              </ng-container>

              <!-- Actions -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let ligne">
                  <button mat-icon-button color="primary" (click)="onEditLigne(ligne)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="onDeleteLigne(ligne)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <div *ngIf="!importation.lignesImportation || importation.lignesImportation.length === 0" class="no-data">
              <mat-icon>inventory_2</mat-icon>
              <p>Aucun article dans cette importation</p>
            </div>
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
                <span class="label">Nombre d'articles :</span>
                <span class="value">{{ importation.lignesImportation?.length || 0 }}</span>
              </div>

              <div class="summary-item">
                <span class="label">Montant total :</span>
                <span class="value amount">{{ importation.montantTotal | currency:'EUR' }}</span>
              </div>

              <div class="summary-item">
                <span class="label">Créée le :</span>
                <span class="value">{{ importation.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="summary-item" *ngIf="importation.updatedAt">
                <span class="label">Modifiée le :</span>
                <span class="value">{{ importation.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Erreur -->
      <div *ngIf="!loading && !importation" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <h2>Importation non trouvée</h2>
        <p>L'importation demandée n'existe pas ou a été supprimée.</p>
        <button mat-raised-button color="primary" (click)="onBack()">
          <mat-icon>arrow_back</mat-icon>
          Retour à la liste
        </button>
      </div>
    </div>
  `,
  styles: [`
    .importation-details-container {
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

    .info-card, .lignes-card, .summary-card {
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

    .info-item.full-width {
      grid-column: 1 / -1;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
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

    .info-item .value.amount {
      color: #1976d2;
      font-size: 1.1em;
    }

    .lignes-table {
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

    .summary-item .value.amount {
      font-size: 1.2em;
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

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ImportationDetailsComponent implements OnInit {
  importation: Importation | null = null;
  loading = true;
  displayedColumns: string[] = ['article', 'quantite', 'prixUnitaire', 'montantLigne', 'actions'];

  constructor(
    private importationService: ImportationService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadImportation();
  }

  loadImportation(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.importationService.getById(+id).subscribe({
        next: (importation) => {
          this.importation = importation;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'importation:', error);
          this.snackBar.open('Erreur lors du chargement de l\'importation', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'EnCours': return 'accent';
      case 'Livree': return 'primary';
      case 'Annulee': return 'warn';
      default: return 'primary';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'EnCours': return 'En Cours';
      case 'Livree': return 'Livrée';
      case 'Annulee': return 'Annulée';
      default: return statut;
    }
  }

  onEdit(): void {
    if (this.importation?.id) {
      this.router.navigate(['/importations', this.importation.id, 'edit']);
    }
  }

  onDuplicate(): void {
    if (this.importation) {
      // Logique de duplication
      this.snackBar.open('Fonctionnalité de duplication en cours de développement', 'Fermer', { duration: 2000 });
    }
  }

  onDelete(): void {
    if (this.importation?.id) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette importation ?')) {
        this.importationService.delete(this.importation.id).subscribe({
          next: () => {
            this.snackBar.open('Importation supprimée avec succès', 'Fermer', { duration: 3000 });
            this.router.navigate(['/importations']);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    }
  }

  onEditLigne(ligne: any): void {
    // Logique d'édition de ligne
    this.snackBar.open('Fonctionnalité d\'édition de ligne en cours de développement', 'Fermer', { duration: 2000 });
  }

  onDeleteLigne(ligne: any): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
      // Logique de suppression de ligne
      this.snackBar.open('Fonctionnalité de suppression de ligne en cours de développement', 'Fermer', { duration: 2000 });
    }
  }

  onBack(): void {
    this.router.navigate(['/importations']);
  }
}


