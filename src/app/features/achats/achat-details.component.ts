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


import { AchatService, Achat } from '../../core/services/achat.service';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-achat-details',
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
    <div class="achat-details-container">
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement des détails...</p>
          </div>
          
      <div *ngIf="!loading && achat" class="details-content">
        <!-- En-tête avec actions -->
        <div class="header-section">
          <div class="header-info">
            <h1>
              <mat-icon>shopping_cart</mat-icon>
              Achat {{ achat.referenceAchat }}
            </h1>
            <div class="status-chip">
              <mat-chip [color]="getStatusColor(achat.statut)" selected>
                {{ getStatusLabel(achat.statut) }}
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
                <span class="value">{{ achat.referenceAchat }}</span>
              </div>
              
              <div class="info-item">
                <span class="label">Fournisseur :</span>
                <span class="value">{{ achat.fournisseur?.nom || 'N/A' }}</span>
              </div>
              
              <div class="info-item">
                <span class="label">Date d'Achat :</span>
                <span class="value">{{ achat.dateAchat | date:'dd/MM/yyyy' }}</span>
              </div>
              
              <div class="info-item">
                <span class="label">Date Livraison Prévue :</span>
                <span class="value">{{ achat.dateLivraisonPrevue ? (achat.dateLivraisonPrevue | date:'dd/MM/yyyy') : 'Non définie' }}</span>
              </div>
              
              <div class="info-item">
                <span class="label">Date Livraison Effective :</span>
                <span class="value">{{ achat.dateLivraisonEffective ? (achat.dateLivraisonEffective | date:'dd/MM/yyyy') : 'Non livrée' }}</span>
          </div>
          
              <div class="info-item">
                <span class="label">Statut :</span>
                <span class="value">
            <mat-chip [color]="getStatusColor(achat.statut)" selected>
              {{ getStatusLabel(achat.statut) }}
            </mat-chip>
                </span>
          </div>
              
              <div class="info-item">
                <span class="label">Mode de Paiement :</span>
                <span class="value">{{ achat.modePaiement }}</span>
        </div>

              <div class="info-item">
                <span class="label">Conditions de Paiement :</span>
                <span class="value">{{ achat.conditionsPaiement }}</span>
              </div>
              
              <div class="info-item" *ngIf="achat.notes">
                <span class="label">Notes :</span>
                <span class="value">{{ achat.notes }}</span>
              </div>
                </div>
              </mat-card-content>
            </mat-card>

        <!-- Informations du fournisseur -->
        <mat-card class="fournisseur-card" *ngIf="achat.fournisseur">
          <mat-card-header>
            <mat-card-title>Informations Fournisseur</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="fournisseur-info">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Code :</span>
                  <span class="value">{{ achat.fournisseur.code }}</span>
          </div>
                
                <div class="info-item">
                  <span class="label">Adresse :</span>
                  <span class="value">{{ achat.fournisseur.adresse }}</span>
        </div>

                <div class="info-item">
                  <span class="label">Téléphone :</span>
                  <span class="value">{{ achat.fournisseur.telephone }}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">Email :</span>
                  <span class="value">{{ achat.fournisseur.email }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Lignes d'achat -->
        <mat-card class="lignes-card">
          <mat-card-header>
            <mat-card-title>Articles Achetés</mat-card-title>
            <mat-card-subtitle>{{ achat.lignesAchat?.length || 0 }} article(s)</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="achat.lignesAchat || []" class="lignes-table">
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
                <th mat-header-cell *matHeaderCellDef>Prix Unitaire HT</th>
                <td mat-cell *matCellDef="let ligne">{{ ligne.prixUnitaire | currency:'EUR' }}</td>
              </ng-container>

              <!-- Montant HT -->
              <ng-container matColumnDef="montantHT">
                <th mat-header-cell *matHeaderCellDef>Montant HT</th>
                <td mat-cell *matCellDef="let ligne">{{ ligne.montantHT | currency:'EUR' }}</td>
              </ng-container>

              <!-- Montant TVA -->
              <ng-container matColumnDef="montantTVA">
                <th mat-header-cell *matHeaderCellDef>Montant TVA</th>
                <td mat-cell *matCellDef="let ligne">{{ ligne.montantTVA | currency:'EUR' }}</td>
              </ng-container>

              <!-- Montant TTC -->
              <ng-container matColumnDef="montantTTC">
                <th mat-header-cell *matHeaderCellDef>Montant TTC</th>
                <td mat-cell *matCellDef="let ligne">{{ ligne.montantTTC | currency:'EUR' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <div *ngIf="!achat.lignesAchat || achat.lignesAchat.length === 0" class="no-data">
              <mat-icon>shopping_basket</mat-icon>
              <p>Aucun article dans cet achat</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Résumé financier -->
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Résumé Financier</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Nombre d'articles :</span>
                <span class="value">{{ achat.lignesAchat?.length || 0 }}</span>
              </div>
              
              <div class="summary-item">
                <span class="label">Montant HT :</span>
                <span class="value">{{ achat.montantHT | currency:'EUR' }}</span>
              </div>
              
              <div class="summary-item">
                <span class="label">Montant TVA :</span>
                <span class="value">{{ achat.montantTVA | currency:'EUR' }}</span>
              </div>
              
              <div class="summary-item total">
                <span class="label">Montant TTC :</span>
                <span class="value">{{ achat.montantTotal | currency:'EUR' }}</span>
              </div>
              
              <div class="summary-item">
                <span class="label">Taux de TVA :</span>
                <span class="value">{{ achat.tauxTVA }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Actions de workflow -->
        <mat-card class="workflow-card">
          <mat-card-header>
            <mat-card-title>Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="workflow-actions">
              <button mat-raised-button color="primary" (click)="validerAchat()" 
                      [disabled]="achat.statut !== 'Brouillon'">
                <mat-icon>check_circle</mat-icon>
                Valider
              </button>
              
              <button mat-raised-button color="accent" (click)="confirmerLivraison()"
                      [disabled]="achat.statut !== 'EnLivraison'">
                <mat-icon>local_shipping</mat-icon>
                Confirmer Livraison
              </button>
              
              <button mat-raised-button color="warn" (click)="annulerAchat()"
                      [disabled]="achat.statut === 'Livree' || achat.statut === 'Annulee'">
                <mat-icon>cancel</mat-icon>
                Annuler
              </button>
              
              <button mat-raised-button color="primary" (click)="genererBonCommande()">
                <mat-icon>description</mat-icon>
                Bon de Commande
              </button>
              
              <button mat-raised-button color="accent" (click)="genererFacture()">
                <mat-icon>receipt</mat-icon>
                Facture
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Historique des achats -->
        <mat-card class="historique-card">
          <mat-card-header>
            <mat-card-title>Historique des Achats</mat-card-title>
            <mat-card-subtitle>Achats récents pour ce fournisseur</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>history</mat-icon>
                  Voir l'historique
                </mat-panel-title>
                <mat-panel-description>
                  {{ historiqueAchats.length || 0 }} achat(s)
                </mat-panel-description>
              </mat-expansion-panel-header>
              
              <table mat-table [dataSource]="historiqueAchats || []" class="historique-table">
                <!-- Date -->
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let achat">{{ achat.dateAchat | date:'dd/MM/yyyy' }}</td>
                </ng-container>

                <!-- Référence -->
                <ng-container matColumnDef="reference">
                  <th mat-header-cell *matHeaderCellDef>Référence</th>
                  <td mat-cell *matCellDef="let achat">{{ achat.referenceAchat }}</td>
                </ng-container>

                <!-- Statut -->
                <ng-container matColumnDef="statut">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let achat">
                    <mat-chip [color]="getStatusColor(achat.statut)" selected>
                      {{ getStatusLabel(achat.statut) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Montant -->
                <ng-container matColumnDef="montant">
                  <th mat-header-cell *matHeaderCellDef>Montant</th>
                  <td mat-cell *matCellDef="let achat">{{ achat.montantTotal | currency:'EUR' }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="historiqueColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: historiqueColumns;"></tr>
              </table>

              <div *ngIf="!historiqueAchats || historiqueAchats.length === 0" class="no-data">
                <mat-icon>history</mat-icon>
                <p>Aucun historique disponible</p>
          </div>
            </mat-expansion-panel>
          </mat-card-content>
        </mat-card>

        <!-- Résumé -->
        <mat-card class="resume-card">
          <mat-card-header>
            <mat-card-title>Résumé</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="resume-grid">
              <div class="resume-item">
                <span class="label">Créé le :</span>
                <span class="value">{{ achat.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>

              <div class="resume-item" *ngIf="achat.updatedAt">
                <span class="label">Modifié le :</span>
                <span class="value">{{ achat.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
        </div>
      </mat-card-content>
        </mat-card>
      </div>

      <!-- Erreur -->
      <div *ngIf="!loading && !achat" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <h2>Achat non trouvé</h2>
        <p>L'achat demandé n'existe pas ou a été supprimé.</p>
        <button mat-raised-button color="primary" (click)="onBack()">
          <mat-icon>arrow_back</mat-icon>
          Retour à la liste
        </button>
      </div>
    </div>
  `,
  styles: [`
    .achat-details-container {
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

    .info-card, .fournisseur-card, .lignes-card, .summary-card, .workflow-card, .historique-card, .resume-card {
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

    .fournisseur-info {
      padding: 16px;
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

    .summary-item.total {
      background-color: #e3f2fd;
      border: 2px solid #1976d2;
      font-weight: bold;
    }

    .summary-item .label {
      font-weight: 500;
      color: #666;
    }

    .summary-item .value {
      font-weight: 600;
      color: #1976d2;
    }

    .workflow-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .historique-table {
      width: 100%;
      margin-top: 16px;
    }

    .resume-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .resume-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    .resume-item .label {
      font-weight: 500;
      color: #666;
    }

    .resume-item .value {
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

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .workflow-actions {
        flex-direction: column;
      }

      .resume-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AchatDetailsComponent implements OnInit {
  achat: Achat | null = null;
  loading = true;
  historiqueAchats: Achat[] = [];
  displayedColumns: string[] = ['article', 'quantite', 'prixUnitaire', 'montantHT', 'montantTVA', 'montantTTC'];
  historiqueColumns: string[] = ['date', 'reference', 'statut', 'montant'];

  constructor(
    private achatService: AchatService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAchat();
  }

  loadAchat(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.achatService.getById(+id).subscribe({
        next: (achat) => {
          this.achat = achat;
          this.loadHistorique();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'achat:', error);
          this.snackBar.open('Erreur lors du chargement de l\'achat', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  loadHistorique(): void {
    if (this.achat?.fournisseurId) {
      this.achatService.getAchatsParFournisseur(this.achat.fournisseurId).subscribe({
        next: (historique) => {
          this.historiqueAchats = historique.slice(0, 10); // Limiter à 10 achats
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'historique:', error);
        }
      });
    }
  }

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'Brouillon': return 'warn';
      case 'EnAttente': return 'accent';
      case 'Validee': return 'primary';
      case 'EnLivraison': return 'accent';
      case 'Livree': return 'primary';
      case 'Annulee': return 'warn';
      default: return 'primary';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'Brouillon': return 'Brouillon';
      case 'EnAttente': return 'En Attente';
      case 'Validee': return 'Validée';
      case 'EnLivraison': return 'En Livraison';
      case 'Livree': return 'Livrée';
      case 'Annulee': return 'Annulée';
      default: return statut;
    }
  }

  onEdit(): void {
    if (this.achat?.id) {
      this.router.navigate(['/achats', this.achat.id, 'edit']);
    }
  }

  onDuplicate(): void {
    if (this.achat) {
      this.achatService.dupliquerAchat(this.achat.id!).subscribe({
        next: (nouvelAchat) => {
          this.snackBar.open('Achat dupliqué avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/achats', nouvelAchat.id, 'edit']);
        },
        error: (error) => {
          console.error('Erreur lors de la duplication:', error);
          this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  onDelete(): void {
    if (this.achat?.id) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) {
        this.achatService.delete(this.achat.id).subscribe({
          next: () => {
            this.snackBar.open('Achat supprimé avec succès', 'Fermer', { duration: 3000 });
            this.router.navigate(['/achats']);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    }
  }

  validerAchat(): void {
    if (this.achat?.id) {
      this.achatService.validerAchat(this.achat.id).subscribe({
        next: (achat) => {
          this.achat = achat;
          this.snackBar.open('Achat validé avec succès', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de la validation:', error);
          this.snackBar.open('Erreur lors de la validation', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  confirmerLivraison(): void {
    if (this.achat?.id) {
      const dateLivraison = new Date();
      this.achatService.confirmerLivraison(this.achat.id, dateLivraison).subscribe({
        next: (achat) => {
          this.achat = achat;
          this.snackBar.open('Livraison confirmée avec succès', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de la confirmation:', error);
          this.snackBar.open('Erreur lors de la confirmation', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  annulerAchat(): void {
    if (this.achat?.id) {
      const motif = prompt('Motif de l\'annulation :');
      if (motif) {
        this.achatService.annulerAchat(this.achat.id, motif).subscribe({
          next: (achat) => {
            this.achat = achat;
            this.snackBar.open('Achat annulé avec succès', 'Fermer', { duration: 3000 });
          },
          error: (error) => {
            console.error('Erreur lors de l\'annulation:', error);
            this.snackBar.open('Erreur lors de l\'annulation', 'Fermer', { duration: 3000 });
          }
        });
      }
    }
  }

  genererBonCommande(): void {
    if (this.achat?.id) {
      this.achatService.genererBonCommande(this.achat.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `bon-commande-${this.achat!.referenceAchat}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Erreur lors de la génération:', error);
          this.snackBar.open('Erreur lors de la génération du bon de commande', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  genererFacture(): void {
    if (this.achat?.id) {
      this.achatService.genererFacture(this.achat.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `facture-${this.achat!.referenceAchat}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Erreur lors de la génération:', error);
          this.snackBar.open('Erreur lors de la génération de la facture', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/achats']);
  }
}

