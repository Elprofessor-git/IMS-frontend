import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { CommandeService } from './commande.service';
import { ModeleBomService, ModeleBom } from './modele-bom.service';
import { CommandeCalculService, FaisabiliteResult, BesoinCalcule } from './commande-calcul.service';

@Component({
  selector: 'app-commande-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  template: `
    <div class="details-container">

      <!-- Chargement -->
      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="56"></mat-spinner>
        <p>Calcul de faisabilité en cours...</p>
      </div>

      <ng-container *ngIf="!loading">

        <!-- En-tête commande -->
        <mat-card class="header-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>shopping_cart</mat-icon>
              Ordre de Fabrication — {{ commande?.numeroCommande || ('OF #' + commandeId) }}
            </mat-card-title>
            <mat-card-subtitle *ngIf="commande">
              Client : {{ commande.clientId }} &nbsp;|&nbsp;
              Statut : {{ commande.statut }} &nbsp;|&nbsp;
              Total pièces : <strong>{{ faisabilite?.nbPieces || 0 }}</strong>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon> Retour
            </button>
            <button mat-button color="primary" (click)="editerCommande()">
              <mat-icon>edit</mat-icon> Modifier
            </button>
            <button mat-raised-button color="primary"
                    *ngIf="faisabilite?.realisable"
                    (click)="lancerCommande()"
                    [disabled]="isLancing">
              <mat-spinner *ngIf="isLancing" diameter="18"></mat-spinner>
              <mat-icon *ngIf="!isLancing">rocket_launch</mat-icon>
              <span *ngIf="!isLancing">Lancer la production</span>
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Badge faisabilité -->
        <mat-card *ngIf="faisabilite" class="badge-card"
                  [class.realisable]="faisabilite.realisable"
                  [class.non-lancable]="!faisabilite.realisable">
          <div class="badge-content">
            <mat-icon class="badge-icon">{{ faisabilite.realisable ? 'check_circle' : 'cancel' }}</mat-icon>
            <div class="badge-text">
              <span class="badge-label">{{ faisabilite.realisable ? '✅ RÉALISABLE' : '❌ NON LANÇABLE' }}</span>
              <span class="badge-sub" *ngIf="!faisabilite.realisable">
                {{ faisabilite.manques.length }} fourniture(s) insuffisante(s)
              </span>
            </div>
          </div>
        </mat-card>

        <!-- Tableau des besoins -->
        <mat-card *ngIf="faisabilite" class="besoins-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>table_chart</mat-icon>
              Analyse des besoins
            </mat-card-title>
            <mat-card-subtitle>
              Modèle BOM : {{ bomNom }} &nbsp;|&nbsp; Sécurité : {{ pctSecurite }}%
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <table mat-table [dataSource]="faisabilite.besoins" class="besoins-table">

              <ng-container matColumnDef="designation">
                <th mat-header-cell *matHeaderCellDef>Fourniture</th>
                <td mat-cell *matCellDef="let b">
                  <strong>{{ b.designation }}</strong>
                  <small class="article-id"> (ID: {{ b.articleId }})</small>
                </td>
              </ng-container>

              <ng-container matColumnDef="qteNette">
                <th mat-header-cell *matHeaderCellDef>Qté nette</th>
                <td mat-cell *matCellDef="let b">
                  {{ b.qteNette | number:'1.0-3' }} {{ b.unite }}
                </td>
              </ng-container>

              <ng-container matColumnDef="qteSecurite">
                <th mat-header-cell *matHeaderCellDef>Qté + sécurité</th>
                <td mat-cell *matCellDef="let b">
                  <strong>{{ b.qteAvecSecurite | number:'1.0-3' }} {{ b.unite }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="stockDispo">
                <th mat-header-cell *matHeaderCellDef>Stock dispo</th>
                <td mat-cell *matCellDef="let b"
                    [class.stock-ok]="b.stockDispo >= b.qteAvecSecurite"
                    [class.stock-low]="b.stockDispo < b.qteAvecSecurite">
                  {{ b.stockDispo | number:'1.0-3' }} {{ b.unite }}
                </td>
              </ng-container>

              <ng-container matColumnDef="couverture">
                <th mat-header-cell *matHeaderCellDef>Couverture</th>
                <td mat-cell *matCellDef="let b">
                  <div class="couverture-cell">
                    <mat-progress-bar
                      mode="determinate"
                      [value]="min100(b.couverturePct)"
                      [class]="calculService.getClasseCouverture(b.couverturePct)">
                    </mat-progress-bar>
                    <span class="couverture-pct"
                          [style.color]="calculService.getCouleurCouverture(b.couverturePct)">
                      {{ b.couverturePct }}%
                    </span>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="colonnes"></tr>
              <tr mat-row *matRowDef="let row; columns: colonnes;"
                  [class.row-danger]="row.couverturePct < 70"
                  [class.row-warning]="row.couverturePct >= 70 && row.couverturePct < 100">
              </tr>
            </table>

            <div *ngIf="faisabilite.besoins.length === 0" class="empty-state">
              <mat-icon>info</mat-icon>
              <p>Aucun besoin calculé. Vérifiez que le modèle BOM contient des fournitures et que les tailles sont renseignées.</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Liste des manques -->
        <mat-card *ngIf="faisabilite && faisabilite.manques.length > 0" class="manques-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon color="warn">warning</mat-icon>
              Fournitures manquantes ({{ faisabilite.manques.length }})
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngFor="let m of faisabilite.manques" class="manque-row">
              <div class="manque-info">
                <strong>{{ m.designation }}</strong>
                <span class="manque-detail">
                  Besoin : {{ m.qteAvecSecurite | number:'1.0-3' }} {{ m.unite }}
                  &nbsp;|&nbsp;
                  Stock : {{ m.stockDispo | number:'1.0-3' }} {{ m.unite }}
                  &nbsp;|&nbsp;
                  Manque : <strong class="manque-qte">{{ (m.qteAvecSecurite - m.stockDispo) | number:'1.0-3' }} {{ m.unite }}</strong>
                </span>
              </div>
              <div class="manque-actions">
                <button mat-stroked-button color="primary" (click)="creerAchat(m)"
                        matTooltip="Créer un achat fournisseur pour cette fourniture">
                  <mat-icon>shopping_bag</mat-icon>
                  Créer achat
                </button>
                <button mat-stroked-button color="accent" (click)="creerImportation(m)"
                        matTooltip="Créer une importation pour cette fourniture">
                  <mat-icon>flight_land</mat-icon>
                  Créer importation
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

      </ng-container>
    </div>
  `,
  styles: [`
    .details-container { max-width: 960px; margin: 20px auto; padding: 0 16px; display: flex; flex-direction: column; gap: 16px; }
    .loading-center { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 16px; color: #666; }
    .header-card mat-card-title { display: flex; align-items: center; gap: 8px; color: #1976d2; }

    /* Badge faisabilité */
    .badge-card { border-left: 6px solid; }
    .badge-card.realisable { border-color: #4caf50; background: #f1f8e9; }
    .badge-card.non-lancable { border-color: #f44336; background: #fff3e0; }
    .badge-content { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .badge-icon { font-size: 40px; height: 40px; width: 40px; }
    .realisable .badge-icon { color: #4caf50; }
    .non-lancable .badge-icon { color: #f44336; }
    .badge-text { display: flex; flex-direction: column; gap: 4px; }
    .badge-label { font-size: 1.3rem; font-weight: 700; }
    .badge-sub { color: #666; }

    /* Tableau besoins */
    .besoins-table { width: 100%; }
    .couverture-cell { display: flex; align-items: center; gap: 8px; min-width: 160px; }
    .couverture-cell mat-progress-bar { flex: 1; height: 10px; border-radius: 5px; }
    .couverture-pct { min-width: 42px; font-weight: 600; font-size: 0.9rem; }
    .couverture-ok ::ng-deep .mdc-linear-progress__bar-inner { border-color: #4caf50 !important; }
    .couverture-warning ::ng-deep .mdc-linear-progress__bar-inner { border-color: #ff9800 !important; }
    .couverture-danger ::ng-deep .mdc-linear-progress__bar-inner { border-color: #f44336 !important; }
    .stock-ok { color: #388e3c; font-weight: 500; }
    .stock-low { color: #d32f2f; font-weight: 500; }
    .article-id { color: #999; font-size: 0.75rem; }
    .row-danger { background: #fff3e0; }
    .row-warning { background: #fff8e1; }
    .empty-state { text-align: center; padding: 32px; color: #999; }

    /* Manques */
    .manques-card { border-left: 4px solid #f44336; }
    .manque-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; flex-wrap: wrap; gap: 8px; }
    .manque-row:last-child { border-bottom: none; }
    .manque-info { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .manque-detail { color: #666; font-size: 0.875rem; }
    .manque-qte { color: #d32f2f; }
    .manque-actions { display: flex; gap: 8px; flex-shrink: 0; }

    @media (max-width: 768px) {
      .manque-row { flex-direction: column; align-items: flex-start; }
      .couverture-cell { min-width: 120px; }
    }
  `]
})
export class CommandeDetailsComponent implements OnInit {
  commandeId: string | null = null;
  commande: any = null;
  bom: ModeleBom | null = null;
  bomNom = '';
  pctSecurite = 5;
  faisabilite: FaisabiliteResult | null = null;
  loading = false;
  isLancing = false;
  colonnes = ['designation', 'qteNette', 'qteSecurite', 'stockDispo', 'couverture'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService,
    private bomService: ModeleBomService,
    public calculService: CommandeCalculService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.commandeId = this.route.snapshot.paramMap.get('id');
    if (this.commandeId) {
      this.chargerEtCalculer();
    }
  }

  private chargerEtCalculer(): void {
    this.loading = true;
    this.commandeService.getById(Number(this.commandeId)).subscribe({
      next: (commande) => {
        this.commande = commande;
        const bomId = commande.modeleBomId;
        this.pctSecurite = commande.pctSecurite ?? 5;
        const tailles = commande.tailles ?? { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

        if (bomId) {
          this.bomService.getById(bomId).subscribe({
            next: (bom) => {
              this.bom = bom;
              this.bomNom = bom.nom;
              this.calculService.calculerFaisabilite(bom, tailles, this.pctSecurite).subscribe({
                next: (result) => { this.faisabilite = result; this.loading = false; },
                error: () => { this.loading = false; }
              });
            },
            error: () => { this.loading = false; }
          });
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.snackBar.open('Impossible de charger la commande', 'Fermer', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  min100(val: number): number {
    return Math.min(val, 100);
  }

  lancerCommande(): void {
    if (!this.commandeId) return;
    this.isLancing = true;
    this.commandeService.changerStatut(Number(this.commandeId), 'EnCours').subscribe({
      next: () => {
        this.snackBar.open('Commande lancée en production', 'OK', { duration: 3000 });
        this.chargerEtCalculer();
        this.isLancing = false;
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erreur', 'Fermer', { duration: 5000 });
        this.isLancing = false;
      }
    });
  }

  creerAchat(manque: BesoinCalcule): void {
    this.router.navigate(['/achats/nouveau'], {
      queryParams: {
        articleId: manque.articleId,
        designation: manque.designation,
        quantite: Math.ceil(manque.qteAvecSecurite - manque.stockDispo),
        unite: manque.unite,
        commandeId: this.commandeId
      }
    });
  }

  creerImportation(manque: BesoinCalcule): void {
    this.router.navigate(['/importations/nouveau'], {
      queryParams: {
        articleId: manque.articleId,
        designation: manque.designation,
        quantite: Math.ceil(manque.qteAvecSecurite - manque.stockDispo),
        unite: manque.unite,
        commandeId: this.commandeId
      }
    });
  }

  editerCommande(): void {
    this.router.navigate(['/commandes', this.commandeId]);
  }

  goBack(): void {
    this.router.navigate(['/commandes']);
  }
}
