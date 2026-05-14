import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';

import { CommandeService, ConfigTaille, BomLigne, ResultatCalcul } from './commande.service';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-commande-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="details-container">

      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="56"></mat-spinner>
        <p>Chargement en cours...</p>
      </div>

      <ng-container *ngIf="!loading && commande">

        <!-- En-tête -->
        <mat-card class="header-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>shopping_cart</mat-icon>
              {{ commande.numeroCommande || ('OF #' + commandeId) }}
            </mat-card-title>
            <mat-card-subtitle>
              Client : {{ commande.client?.nom || commande.clientId }}
              <ng-container *ngIf="commande.marque"> &nbsp;|&nbsp; Marque : {{ commande.marque.nom }}</ng-container>
              &nbsp;|&nbsp; Statut : <strong>{{ commande.statut }}</strong>
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
                    *ngIf="toutSuffisant && calculDone"
                    (click)="lancerCommande()"
                    [disabled]="isLancing">
              <mat-spinner *ngIf="isLancing" diameter="18"></mat-spinner>
              <mat-icon *ngIf="!isLancing">rocket_launch</mat-icon>
              <span *ngIf="!isLancing">Lancer la production</span>
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Onglets -->
        <mat-card class="tabs-card">
          <mat-tab-group animationDuration="200ms">

            <!-- ===== ONGLET 1 — INFOS GÉNÉRALES ===== -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>info</mat-icon>&nbsp;Infos générales
              </ng-template>

              <div class="tab-content">
                <div class="info-grid">
                  <div class="info-row"><span class="label">Numéro :</span><span class="value">{{ commande.numeroCommande }}</span></div>
                  <div class="info-row"><span class="label">Date commande :</span><span class="value">{{ commande.dateCommande | date:'dd/MM/yyyy' }}</span></div>
                  <div class="info-row"><span class="label">Livraison prévue :</span><span class="value">{{ commande.dateLivraisonSouhaitee ? (commande.dateLivraisonSouhaitee | date:'dd/MM/yyyy') : '—' }}</span></div>
                  <div class="info-row"><span class="label">Client :</span><span class="value">{{ commande.client?.nom || commande.clientId }}</span></div>
                  <div class="info-row" *ngIf="commande.marque"><span class="label">Marque :</span><span class="value">{{ commande.marque.nom }}</span></div>
                  <div class="info-row"><span class="label">Statut :</span><span class="value"><strong>{{ commande.statut }}</strong></span></div>
                  <div class="info-row" *ngIf="commande.montantTotal"><span class="label">Montant :</span><span class="value">{{ commande.montantTotal | number:'1.2-2' }} {{ commande.devise || 'EUR' }}</span></div>
                  <div class="info-row" *ngIf="commande.notesSpeciales"><span class="label">Notes :</span><span class="value">{{ commande.notesSpeciales }}</span></div>
                </div>
              </div>
            </mat-tab>

            <!-- ===== ONGLET 2 — TAILLES & QUANTITÉS ===== -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>straighten</mat-icon>&nbsp;Tailles
              </ng-template>

              <div class="tab-content">
                <div class="section-toolbar">
                  <span class="total-label">Total pièces : <strong class="total-value">{{ totalPieces }}</strong></span>
                  <button mat-stroked-button color="primary" (click)="addTaille()">
                    <mat-icon>add</mat-icon> Ajouter taille
                  </button>
                </div>

                <div class="taille-list">
                  <div *ngFor="let t of tailles; let i = index" class="taille-row">
                    <mat-form-field appearance="outline" class="taille-input">
                      <mat-label>Taille</mat-label>
                      <input matInput [(ngModel)]="t.taille" placeholder="ex: S, M, 36, 38...">
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="quantite-input">
                      <mat-label>Quantité</mat-label>
                      <input matInput type="number" min="0" [(ngModel)]="t.quantite" (ngModelChange)="recalcTotal()">
                    </mat-form-field>
                    <button mat-icon-button color="warn" (click)="removeTaille(i)" matTooltip="Supprimer">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                  <div *ngIf="tailles.length === 0" class="empty-hint">
                    <mat-icon>info</mat-icon> Aucune taille définie. Cliquez sur "Ajouter taille".
                  </div>
                </div>

                <div class="tab-actions">
                  <button mat-raised-button color="primary" [disabled]="savingTailles" (click)="saveTailles()">
                    <mat-spinner *ngIf="savingTailles" diameter="18"></mat-spinner>
                    <mat-icon *ngIf="!savingTailles">save</mat-icon>
                    Sauvegarder
                  </button>
                </div>
              </div>
            </mat-tab>

            <!-- ===== ONGLET 3 — NOMENCLATURE BOM ===== -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>account_tree</mat-icon>&nbsp;Nomenclature
              </ng-template>

              <div class="tab-content">
                <div class="section-toolbar">
                  <span class="total-label">{{ bomLignes.length }} fourniture(s)</span>
                  <button mat-stroked-button color="primary" (click)="addBomLigne()">
                    <mat-icon>add</mat-icon> Ajouter fourniture
                  </button>
                </div>

                <div class="bom-list">
                  <div *ngFor="let b of bomLignes; let i = index" class="bom-row">
                    <mat-form-field appearance="outline" class="article-select">
                      <mat-label>Article / Fourniture</mat-label>
                      <mat-select [(ngModel)]="b.articleId">
                        <mat-option *ngFor="let a of articles" [value]="a.id">
                          {{ a.designation }} ({{ a.unite }})
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="qte-input">
                      <mat-label>Qté / pièce</mat-label>
                      <input matInput type="number" min="0" step="0.001" [(ngModel)]="b.quantiteParPiece">
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="unite-input">
                      <mat-label>Unité</mat-label>
                      <input matInput [(ngModel)]="b.unite" placeholder="m, kg, pcs...">
                    </mat-form-field>
                    <button mat-icon-button color="warn" (click)="removeBomLigne(i)" matTooltip="Supprimer">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                  <div *ngIf="bomLignes.length === 0" class="empty-hint">
                    <mat-icon>info</mat-icon> Aucune fourniture définie. Cliquez sur "Ajouter fourniture".
                  </div>
                </div>

                <div class="tab-actions">
                  <button mat-raised-button color="primary" [disabled]="savingBom" (click)="saveBom()">
                    <mat-spinner *ngIf="savingBom" diameter="18"></mat-spinner>
                    <mat-icon *ngIf="!savingBom">save</mat-icon>
                    Sauvegarder BOM
                  </button>
                </div>
              </div>
            </mat-tab>

            <!-- ===== ONGLET 4 — CALCUL & RÉSULTAT ===== -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>calculate</mat-icon>&nbsp;Calcul
              </ng-template>

              <div class="tab-content">
                <div class="calcul-header">
                  <mat-form-field appearance="outline" class="marge-field">
                    <mat-label>Marge de sécurité</mat-label>
                    <input matInput type="number" min="0" max="100" [(ngModel)]="marge">
                    <span matSuffix>%</span>
                    <mat-hint>Marge ajoutée aux besoins calculés</mat-hint>
                  </mat-form-field>
                  <button mat-raised-button color="accent" [disabled]="calculEnCours" (click)="lancerCalcul()">
                    <mat-spinner *ngIf="calculEnCours" diameter="18"></mat-spinner>
                    <mat-icon *ngIf="!calculEnCours">play_arrow</mat-icon>
                    {{ calculDone ? 'Recalculer' : 'Calculer' }}
                  </button>
                </div>

                <!-- Badge résultat -->
                <div *ngIf="calculDone" class="badge-result"
                     [class.badge-ok]="toutSuffisant"
                     [class.badge-ko]="!toutSuffisant">
                  <mat-icon>{{ toutSuffisant ? 'check_circle' : 'cancel' }}</mat-icon>
                  <span>{{ toutSuffisant ? '✅ RÉALISABLE' : '❌ NON LANÇABLE' }}</span>
                  <span *ngIf="!toutSuffisant" class="badge-sub">
                    — {{ manques.length }} fourniture(s) insuffisante(s)
                  </span>
                </div>

                <!-- Tableau résultats -->
                <div *ngIf="calculDone && resultats.length > 0" class="result-table-wrap">
                  <table mat-table [dataSource]="resultats" class="result-table">

                    <ng-container matColumnDef="article">
                      <th mat-header-cell *matHeaderCellDef>Article</th>
                      <td mat-cell *matCellDef="let r">
                        <strong>{{ r.article?.designation || ('ID ' + r.articleId) }}</strong>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="besoinFinal">
                      <th mat-header-cell *matHeaderCellDef>Besoin +{{ marge }}%</th>
                      <td mat-cell *matCellDef="let r">{{ r.besoinFinal | number:'1.0-3' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="qteAchat">
                      <th mat-header-cell *matHeaderCellDef>Achat</th>
                      <td mat-cell *matCellDef="let r">{{ r.qteAchat | number:'1.0-3' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="qteImport">
                      <th mat-header-cell *matHeaderCellDef>Import</th>
                      <td mat-cell *matCellDef="let r">{{ r.qteImport | number:'1.0-3' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="qteStockReserve">
                      <th mat-header-cell *matHeaderCellDef>Stock réservé</th>
                      <td mat-cell *matCellDef="let r">{{ r.qteStockReserve | number:'1.0-3' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="qteDisponible">
                      <th mat-header-cell *matHeaderCellDef>Total dispo</th>
                      <td mat-cell *matCellDef="let r"
                          [class.dispo-ok]="r.estSuffisant"
                          [class.dispo-ko]="!r.estSuffisant">
                        <strong>{{ r.qteDisponible | number:'1.0-3' }}</strong>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="statut">
                      <th mat-header-cell *matHeaderCellDef>Statut</th>
                      <td mat-cell *matCellDef="let r">
                        <mat-icon [style.color]="r.estSuffisant ? '#4caf50' : '#f44336'">
                          {{ r.estSuffisant ? 'check_circle' : 'cancel' }}
                        </mat-icon>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="colonnesResultat"></tr>
                    <tr mat-row *matRowDef="let row; columns: colonnesResultat;"
                        [class.row-ko]="!row.estSuffisant"></tr>
                  </table>
                </div>

                <!-- Liste des manques -->
                <div *ngIf="calculDone && manques.length > 0" class="manques-section">
                  <h4><mat-icon color="warn">warning</mat-icon> Fournitures insuffisantes</h4>
                  <div *ngFor="let m of manques" class="manque-row">
                    <span><strong>{{ m.article?.designation || ('ID ' + m.articleId) }}</strong></span>
                    <span class="manque-detail">
                      Besoin : {{ m.besoinFinal | number:'1.0-3' }}
                      &nbsp;|&nbsp; Dispo : {{ m.qteDisponible | number:'1.0-3' }}
                      &nbsp;|&nbsp; <span class="manque-val">Manque : {{ m.manque | number:'1.0-3' }}</span>
                    </span>
                  </div>
                </div>

                <div *ngIf="calculDone && resultats.length === 0" class="empty-hint">
                  <mat-icon>info</mat-icon> Aucun résultat. Vérifiez que des tailles et une BOM sont définies.
                </div>
              </div>
            </mat-tab>

          </mat-tab-group>
        </mat-card>

      </ng-container>

      <mat-card *ngIf="!loading && !commande" class="error-card">
        <mat-card-content>
          <mat-icon color="warn">error</mat-icon>
          <p>Commande introuvable.</p>
          <button mat-raised-button (click)="goBack()">Retour</button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .details-container { max-width: 1000px; margin: 20px auto; padding: 0 16px; display: flex; flex-direction: column; gap: 16px; }
    .loading-center { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 16px; color: #666; }
    .header-card mat-card-title { display: flex; align-items: center; gap: 8px; color: #1976d2; }
    .tabs-card { padding: 0; }
    .tab-content { padding: 24px 20px; }

    /* Infos */
    .info-grid { display: flex; flex-direction: column; gap: 10px; max-width: 600px; }
    .info-row { display: flex; gap: 12px; }
    .label { color: #666; min-width: 160px; font-size: 0.875rem; }
    .value { font-weight: 500; }

    /* Toolbar */
    .section-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .total-label { font-size: 0.95rem; color: #555; }
    .total-value { font-size: 1.2rem; color: #1976d2; }

    /* Tailles */
    .taille-list { display: flex; flex-direction: column; gap: 8px; }
    .taille-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .taille-input { width: 180px; }
    .quantite-input { width: 130px; }

    /* BOM */
    .bom-list { display: flex; flex-direction: column; gap: 8px; }
    .bom-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .article-select { flex: 1; min-width: 200px; }
    .qte-input { width: 130px; }
    .unite-input { width: 110px; }

    /* Actions */
    .tab-actions { margin-top: 20px; display: flex; justify-content: flex-end; }
    .empty-hint { display: flex; align-items: center; gap: 8px; color: #999; padding: 16px 0; }

    /* Calcul */
    .calcul-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .marge-field { width: 200px; }
    .badge-result { display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-radius: 8px; font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; }
    .badge-ok { background: #f1f8e9; color: #388e3c; border-left: 6px solid #4caf50; }
    .badge-ko { background: #fff3e0; color: #d32f2f; border-left: 6px solid #f44336; }
    .badge-sub { font-weight: 400; font-size: 0.9rem; }
    .result-table-wrap { overflow-x: auto; }
    .result-table { width: 100%; }
    .dispo-ok { color: #388e3c; font-weight: 600; }
    .dispo-ko { color: #d32f2f; font-weight: 600; }
    .row-ko { background: #fff3e0; }
    .manques-section { margin-top: 20px; }
    .manques-section h4 { display: flex; align-items: center; gap: 6px; color: #d32f2f; margin-bottom: 12px; }
    .manque-row { display: flex; flex-direction: column; gap: 4px; padding: 10px 0; border-bottom: 1px solid #eee; }
    .manque-row:last-child { border-bottom: none; }
    .manque-detail { color: #666; font-size: 0.875rem; }
    .manque-val { color: #d32f2f; font-weight: 600; }
    .error-card mat-card-content { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px; }

    @media (max-width: 768px) {
      .taille-row, .bom-row { flex-direction: column; align-items: flex-start; }
      .article-select, .taille-input, .quantite-input, .qte-input, .unite-input { width: 100%; }
    }
  `]
})
export class CommandeDetailsComponent implements OnInit {
  commandeId: string | null = null;
  commande: any = null;
  loading = false;
  isLancing = false;

  // Onglet 2 — Tailles
  tailles: ConfigTaille[] = [];
  savingTailles = false;
  totalPieces = 0;

  // Onglet 3 — BOM
  bomLignes: BomLigne[] = [];
  articles: any[] = [];
  savingBom = false;

  // Onglet 4 — Calcul
  marge = 5;
  calculEnCours = false;
  calculDone = false;
  resultats: ResultatCalcul[] = [];
  toutSuffisant = false;
  manques: ResultatCalcul[] = [];
  colonnesResultat = ['article', 'besoinFinal', 'qteAchat', 'qteImport', 'qteStockReserve', 'qteDisponible', 'statut'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService,
    private articleService: ArticleService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.commandeId = this.route.snapshot.paramMap.get('id');
    if (this.commandeId) {
      this.loadCommande();
      this.loadTailles();
      this.loadBom();
      this.loadResultat();
    }
    this.articleService.getAll().subscribe({ next: (data) => this.articles = data, error: () => {} });
  }

  private loadCommande(): void {
    this.loading = true;
    this.commandeService.getById(Number(this.commandeId)).subscribe({
      next: (c) => { this.commande = c; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  // --- Tailles ---
  loadTailles(): void {
    this.commandeService.getTailles(Number(this.commandeId)).subscribe({
      next: (data) => { this.tailles = data; this.recalcTotal(); },
      error: () => {}
    });
  }

  addTaille(): void {
    this.tailles.push({ taille: '', quantite: 0 });
  }

  removeTaille(i: number): void {
    this.tailles.splice(i, 1);
    this.recalcTotal();
  }

  recalcTotal(): void {
    this.totalPieces = this.tailles.reduce((s, t) => s + (Number(t.quantite) || 0), 0);
  }

  saveTailles(): void {
    const valides = this.tailles.filter(t => t.taille.trim() && t.quantite > 0);
    if (valides.length === 0) {
      this.snackBar.open('Ajoutez au moins une taille avec une quantité > 0', 'OK', { duration: 4000 });
      return;
    }
    this.savingTailles = true;
    this.commandeService.setTailles(Number(this.commandeId), valides).subscribe({
      next: () => {
        this.snackBar.open('Tailles sauvegardées', 'OK', { duration: 3000 });
        this.savingTailles = false;
        this.loadTailles();
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erreur serveur', 'Fermer', { duration: 5000 });
        this.savingTailles = false;
      }
    });
  }

  // --- BOM ---
  loadBom(): void {
    this.commandeService.getBom(Number(this.commandeId)).subscribe({
      next: (data) => this.bomLignes = data,
      error: () => {}
    });
  }

  addBomLigne(): void {
    this.bomLignes.push({ articleId: 0, quantiteParPiece: 0, unite: '' });
  }

  removeBomLigne(i: number): void {
    this.bomLignes.splice(i, 1);
  }

  saveBom(): void {
    const valides = this.bomLignes.filter(b => b.articleId > 0 && b.quantiteParPiece > 0);
    if (valides.length === 0) {
      this.snackBar.open('Ajoutez au moins une fourniture avec un article et une quantité > 0', 'OK', { duration: 4000 });
      return;
    }
    this.savingBom = true;
    this.commandeService.setBom(Number(this.commandeId), valides).subscribe({
      next: () => {
        this.snackBar.open('BOM sauvegardée', 'OK', { duration: 3000 });
        this.savingBom = false;
        this.loadBom();
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erreur serveur', 'Fermer', { duration: 5000 });
        this.savingBom = false;
      }
    });
  }

  // --- Calcul ---
  lancerCalcul(): void {
    this.calculEnCours = true;
    this.commandeService.calculer(Number(this.commandeId), this.marge).subscribe({
      next: () => {
        this.calculEnCours = false;
        this.loadResultat();
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erreur calcul', 'Fermer', { duration: 5000 });
        this.calculEnCours = false;
      }
    });
  }

  loadResultat(): void {
    this.commandeService.getResultatCalcul(Number(this.commandeId)).subscribe({
      next: (data) => {
        this.resultats = data;
        this.calculDone = data.length > 0;
        this.toutSuffisant = data.length > 0 && data.every(r => r.estSuffisant);
        this.manques = data.filter(r => !r.estSuffisant);
      },
      error: () => {}
    });
  }

  // --- Navigation ---
  lancerCommande(): void {
    if (!this.commandeId) return;
    this.isLancing = true;
    this.commandeService.genererTaches(Number(this.commandeId)).subscribe({
      next: () => {
        this.snackBar.open('Commande lancée en production', 'OK', { duration: 3000 });
        this.loadCommande();
        this.isLancing = false;
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erreur', 'Fermer', { duration: 5000 });
        this.isLancing = false;
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
