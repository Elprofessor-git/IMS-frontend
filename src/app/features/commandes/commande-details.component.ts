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
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';

import { CommandeService, ConfigTaille, BomLigne, ResultatCalcul } from './commande.service';
import { ArticleService } from '../../core/services/article.service';
import { MarqueService } from './marque.service';
import { ModeleBomService, ModeleBom } from './modele-bom.service';
import { AchatService } from '../../core/services/achat.service';
import { StockService } from '../stock/stock.service';
import { ImportationService } from '../importations/importation.service';

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
    MatSelectModule,
    MatExpansionModule
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
              <ng-container *ngIf="marque?.plateforme">
                <mat-icon class="sub-icon">store</mat-icon>{{ marque.plateforme.nom }}
                <mat-icon class="sub-sep">chevron_right</mat-icon>
              </ng-container>
              <ng-container *ngIf="marque">
                <mat-icon class="sub-icon">label</mat-icon>{{ marque.nom }}
                <mat-icon class="sub-sep">chevron_right</mat-icon>
              </ng-container>
              <mat-icon class="sub-icon">person</mat-icon>{{ commande.client?.nom || commande.clientId }}
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
            <button mat-raised-button color="accent"
                    (click)="verifierFaisabilite()"
                    [disabled]="verificationEnCours">
              <mat-spinner *ngIf="verificationEnCours" diameter="18"></mat-spinner>
              <mat-icon *ngIf="!verificationEnCours">fact_check</mat-icon>
              <span *ngIf="!verificationEnCours">Vérifier faisabilité</span>
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

                <!-- Hiérarchie Plateforme > Marque > Commande -->
                <div class="hierarchy-banner" *ngIf="marque">
                  <ng-container *ngIf="marque.plateforme">
                    <mat-icon class="hier-icon">store</mat-icon>
                    <span class="hier-name">{{ marque.plateforme.nom }}</span>
                    <mat-icon class="hier-sep">chevron_right</mat-icon>
                  </ng-container>
                  <mat-icon class="hier-icon">label</mat-icon>
                  <span class="hier-name">{{ marque.nom }}</span>
                  <mat-icon class="hier-sep">chevron_right</mat-icon>
                  <mat-icon class="hier-icon">shopping_cart</mat-icon>
                  <span class="hier-name hier-current">{{ commande.numeroCommande }}</span>
                </div>

                <div class="info-grid">
                  <div class="info-row"><span class="label">Numéro :</span><span class="value">{{ commande.numeroCommande }}</span></div>
                  <div class="info-row"><span class="label">Titre :</span><span class="value">{{ commande.titreCommande }}</span></div>
                  <div class="info-row"><span class="label">Date création :</span><span class="value">{{ commande.dateCreation | date:'dd/MM/yyyy' }}</span></div>
                  <div class="info-row"><span class="label">Livraison souhaitée :</span><span class="value">{{ commande.dateLivraisonSouhaitee ? (commande.dateLivraisonSouhaitee | date:'dd/MM/yyyy') : '—' }}</span></div>
                  <div class="info-row"><span class="label">Client :</span><span class="value">{{ commande.client?.nom || commande.clientId }}</span></div>
                  <div class="info-row" *ngIf="marque?.plateforme"><span class="label">Plateforme :</span><span class="value">{{ marque.plateforme.nom }}</span></div>
                  <div class="info-row" *ngIf="marque"><span class="label">Marque :</span><span class="value">{{ marque.nom }}</span></div>
                  <div class="info-row"><span class="label">Statut :</span><span class="value"><strong>{{ commande.statut }}</strong></span></div>
                  <div class="info-row" *ngIf="commande.montantTotal"><span class="label">Montant :</span><span class="value">{{ commande.montantTotal | number:'1.2-2' }} EUR</span></div>
                  <div class="info-row" *ngIf="commande.descriptionCommande"><span class="label">Description :</span><span class="value">{{ commande.descriptionCommande }}</span></div>
                  <div class="info-row" *ngIf="commande.pourcentageRessourcesCouvertes != null">
                    <span class="label">Ressources couvertes :</span>
                    <span class="value">{{ commande.pourcentageRessourcesCouvertes | number:'1.0-1' }}%</span>
                  </div>
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

                <div class="form-row">
                  <mat-form-field appearance="outline" style="width: calc(50% - 8px)">
                    <mat-label>Charger un modèle BOM</mat-label>
                    <mat-select [(ngModel)]="selectedModeleBomId"
                                (selectionChange)="onModeleBomChange($event.value)">
                      <mat-option [value]="null">-- Saisie manuelle --</mat-option>
                      <mat-option *ngFor="let m of modelesBom" [value]="m.id">
                        {{ m.nom }}<ng-container *ngIf="m.fournitures?.length"> ({{ m.fournitures.length }} fournitures)</ng-container>
                      </mat-option>
                    </mat-select>
                    <mat-icon matSuffix>account_tree</mat-icon>
                    <mat-hint>Pré-remplit les fournitures — vous pouvez ensuite les ajuster</mat-hint>
                  </mat-form-field>
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
                    <mat-label>% Sécurité</mat-label>
                    <input matInput type="number" min="0" max="20" [(ngModel)]="pctSecurite">
                    <span matSuffix>%</span>
                    <mat-hint>Marge par commande — 0 à 20 %</mat-hint>
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

                <!-- Tableau résultats agrégés -->
                <div *ngIf="calculDone && resultats.length > 0" class="result-table-wrap">
                  <table mat-table [dataSource]="resultats" class="result-table">

                    <ng-container matColumnDef="article">
                      <th mat-header-cell *matHeaderCellDef>Article</th>
                      <td mat-cell *matCellDef="let r">
                        <strong>{{ r.article?.designation || ('ID ' + r.articleId) }}</strong>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="besoinFinal">
                      <th mat-header-cell *matHeaderCellDef>Besoin +{{ pctSecurite }}%</th>
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

                <!-- Stock ventilé détaillé par article (Option B) -->
                <div *ngIf="calculDone && resultats.length > 0" class="ventile-section-title">
                  <mat-icon>layers</mat-icon>
                  <span>Stock ventilé par source</span>
                  <mat-spinner *ngIf="loadingVentile" diameter="18"></mat-spinner>
                </div>

                <mat-accordion *ngIf="calculDone && resultats.length > 0 && !loadingVentile"
                               class="ventile-accordion">
                  <mat-expansion-panel *ngFor="let r of resultats" class="ventile-panel"
                                       [class.panel-ko]="!r.estSuffisant">
                    <mat-expansion-panel-header>
                      <mat-panel-title class="panel-title">
                        <mat-icon [style.color]="r.estSuffisant ? '#4caf50' : '#f44336'" class="panel-status-icon">
                          {{ r.estSuffisant ? 'check_circle' : 'cancel' }}
                        </mat-icon>
                        {{ r.article?.designation || ('ID ' + r.articleId) }}
                      </mat-panel-title>
                      <mat-panel-description class="panel-desc">
                        Besoin : {{ r.besoinFinal | number:'1.0-2' }}
                        &nbsp;/&nbsp; Dispo : {{ r.qteDisponible | number:'1.0-2' }}
                        <span *ngIf="!r.estSuffisant" class="manque-chip">
                          Manque : {{ r.manque | number:'1.0-2' }}
                        </span>
                      </mat-panel-description>
                    </mat-expansion-panel-header>

                    <!-- Importations liées — N entrées, une par importation -->
                    <ng-container *ngFor="let imps of [getImportationsForArticle(r.articleId)]">
                      <div class="source-block" *ngIf="imps.length > 0">
                        <div class="source-header">
                          <mat-icon class="src-icon import-icon">flight_land</mat-icon>
                          <strong>Importations</strong>
                        </div>
                        <div *ngFor="let imp of imps" class="source-row">
                          <span class="src-ref">
                            {{ imp.ref }}
                            <span class="src-meta" *ngIf="imp.date">({{ imp.date | date:'dd/MM/yyyy' }})</span>
                          </span>
                          <span class="src-qte">{{ imp.quantite | number:'1.0-3' }} {{ r.article?.unite || '' }}</span>
                        </div>
                        <div class="source-subtotal">
                          Sous-total import :
                          <strong>{{ getSubtotal(imps) | number:'1.0-3' }} {{ r.article?.unite || '' }}</strong>
                        </div>
                      </div>
                    </ng-container>

                    <!-- Achats liés — N entrées, une par achat -->
                    <ng-container *ngFor="let achats of [getAchatsForArticle(r.articleId)]">
                      <div class="source-block" *ngIf="achats.length > 0">
                        <div class="source-header">
                          <mat-icon class="src-icon achat-icon">shopping_cart</mat-icon>
                          <strong>Achats</strong>
                        </div>
                        <div *ngFor="let a of achats" class="source-row">
                          <span class="src-ref">
                            {{ a.ref }}
                            <span class="src-meta" *ngIf="a.fournisseur">({{ a.fournisseur }})</span>
                          </span>
                          <span class="src-qte">{{ a.quantite | number:'1.0-3' }} {{ r.article?.unite || '' }}</span>
                        </div>
                        <div class="source-subtotal">
                          Sous-total achat :
                          <strong>{{ getSubtotal(achats) | number:'1.0-3' }} {{ r.article?.unite || '' }}</strong>
                        </div>
                      </div>
                    </ng-container>

                    <!-- Stock réservé — N entrées, un par lot -->
                    <ng-container *ngFor="let lots of [getStockForArticle(r.articleId)]">
                      <div class="source-block" *ngIf="lots.length > 0">
                        <div class="source-header">
                          <mat-icon class="src-icon stock-icon">inventory_2</mat-icon>
                          <strong>Stock réservé</strong>
                        </div>
                        <div *ngFor="let s of lots" class="source-row">
                          <span class="src-ref">{{ s.numeroLot || ('LOT-' + s.id) }}</span>
                          <span class="src-qte">{{ s.quantite | number:'1.0-3' }} {{ r.article?.unite || '' }}</span>
                        </div>
                        <div class="source-subtotal">
                          Sous-total réservé :
                          <strong>{{ getSubtotal(lots) | number:'1.0-3' }} {{ r.article?.unite || '' }}</strong>
                        </div>
                      </div>
                    </ng-container>

                    <div *ngIf="!hasVentileData(r.articleId)" class="empty-hint">
                      <mat-icon>info</mat-icon> Aucune source de stock trouvée pour cet article.
                    </div>

                    <!-- Récapitulatif total par article -->
                    <div class="ventile-total"
                         [class.total-ok]="r.estSuffisant"
                         [class.total-ko]="!r.estSuffisant">
                      <div class="total-row">
                        <span>Total disponible</span>
                        <strong>{{ r.qteDisponible | number:'1.0-3' }} {{ r.article?.unite || '' }}</strong>
                      </div>
                      <div class="total-row">
                        <span>Besoin (+{{ pctSecurite }}% marge)</span>
                        <strong>{{ r.besoinFinal | number:'1.0-3' }} {{ r.article?.unite || '' }}</strong>
                      </div>
                      <div class="total-row result-line"
                           [class.result-ok]="r.estSuffisant"
                           [class.result-ko]="!r.estSuffisant">
                        <mat-icon>{{ r.estSuffisant ? 'check_circle' : 'cancel' }}</mat-icon>
                        <span *ngIf="r.estSuffisant">
                          RÉALISABLE — surplus +{{ (r.qteDisponible - r.besoinFinal) | number:'1.0-3' }}
                        </span>
                        <span *ngIf="!r.estSuffisant">
                          NON LANÇABLE — manque {{ r.manque | number:'1.0-3' }}
                        </span>
                      </div>
                    </div>
                  </mat-expansion-panel>
                </mat-accordion>

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
    .details-container { max-width: 1100px; margin: 20px auto; padding: 0 16px; display: flex; flex-direction: column; gap: 16px; }
    .loading-center { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 16px; color: #666; }

    /* Header */
    .header-card mat-card-title { display: flex; align-items: center; gap: 8px; color: #1976d2; }
    .header-card mat-card-subtitle { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .sub-icon { font-size: 16px; width: 16px; height: 16px; color: #888; }
    .sub-sep { font-size: 16px; width: 16px; height: 16px; color: #bbb; }

    /* Hierarchy banner */
    .hierarchy-banner { display: flex; align-items: center; gap: 6px; background: #f5f5f5; border-radius: 8px; padding: 10px 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .hier-icon { font-size: 18px; width: 18px; height: 18px; color: #1976d2; }
    .hier-sep { font-size: 18px; width: 18px; height: 18px; color: #bbb; }
    .hier-name { font-size: 0.9rem; color: #444; }
    .hier-current { font-weight: 700; color: #1976d2; }

    /* Tabs */
    .tabs-card { padding: 0; }
    .tab-content { padding: 24px 20px; }

    /* Infos */
    .info-grid { display: flex; flex-direction: column; gap: 10px; max-width: 600px; }
    .info-row { display: flex; gap: 12px; }
    .label { color: #666; min-width: 180px; font-size: 0.875rem; }
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
    .result-table-wrap { overflow-x: auto; margin-bottom: 24px; }
    .result-table { width: 100%; }
    .dispo-ok { color: #388e3c; font-weight: 600; }
    .dispo-ko { color: #d32f2f; font-weight: 600; }
    .row-ko { background: #fff3e0; }

    /* Ventilé */
    .ventile-section-title { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 600; color: #444; margin: 8px 0 12px; }
    .ventile-accordion { margin-bottom: 24px; }
    .ventile-panel { margin-bottom: 6px; }
    .panel-ko { border-left: 4px solid #f44336; }
    .panel-title { display: flex; align-items: center; gap: 8px; font-weight: 600; }
    .panel-status-icon { font-size: 18px; width: 18px; height: 18px; }
    .panel-desc { display: flex; align-items: center; gap: 8px; color: #555; font-size: 0.85rem; }
    .manque-chip { background: #ffebee; color: #c62828; border-radius: 12px; padding: 2px 10px; font-size: 0.8rem; font-weight: 600; }
    .source-block { margin-bottom: 16px; }
    .source-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; color: #333; font-size: 0.9rem; font-weight: 600; }
    .src-icon { font-size: 18px; width: 18px; height: 18px; }
    .achat-icon { color: #1976d2; }
    .stock-icon { color: #388e3c; }
    .import-icon { color: #f57c00; }
    .source-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 10px; background: #fafafa; border-radius: 4px; margin-bottom: 3px; font-size: 0.875rem; }
    .src-ref { color: #555; display: flex; align-items: center; gap: 4px; }
    .src-meta { color: #888; font-size: 0.8rem; }
    .src-qte { font-weight: 600; color: #1976d2; white-space: nowrap; }
    .source-subtotal { display: flex; justify-content: flex-end; gap: 6px; padding: 4px 10px; font-size: 0.85rem; color: #555; border-top: 1px dashed #ddd; margin-top: 4px; }
    .source-subtotal strong { color: #333; }
    .ventile-total { margin-top: 16px; border-top: 2px solid #e0e0e0; padding-top: 12px; display: flex; flex-direction: column; gap: 6px; }
    .total-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; padding: 2px 4px; }
    .total-row strong { font-size: 1rem; }
    .result-line { margin-top: 4px; padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; }
    .result-ok { background: #f1f8e9; color: #388e3c; }
    .result-ko { background: #fff3e0; color: #d32f2f; }
    .total-ok { background: #f9fbe7; border-radius: 8px; padding: 12px 16px; }
    .total-ko { background: #fff8f5; border-radius: 8px; padding: 12px 16px; }

    /* Manques */
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
      .hierarchy-banner { font-size: 0.85rem; }
    }
  `]
})
export class CommandeDetailsComponent implements OnInit {
  // ÉTAPE 6 — number au lieu de string | null
  commandeId = 0;
  commande: any = null;
  loading = false;
  isLancing = false;
  verificationEnCours = false;

  // ÉTAPE 2 — Hiérarchie
  marque: any = null;

  // Onglet 2 — Tailles
  tailles: ConfigTaille[] = [];
  savingTailles = false;
  totalPieces = 0;

  // Onglet 3 — BOM
  bomLignes: BomLigne[] = [];
  modelesBom: ModeleBom[] = [];
  selectedModeleBomId: number | null = null;
  articles: any[] = [];
  savingBom = false;

  // Onglet 4 — Calcul
  pctSecurite = 5;
  calculEnCours = false;
  calculDone = false;
  resultats: ResultatCalcul[] = [];
  toutSuffisant = false;
  manques: ResultatCalcul[] = [];
  colonnesResultat = ['article', 'besoinFinal', 'qteAchat', 'qteImport', 'qteStockReserve', 'qteDisponible', 'statut'];

  // ÉTAPE 4 — Stock ventilé
  achatsLies: any[] = [];
  stockReserve: any[] = [];
  importationsLiees: any[] = [];
  loadingVentile = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService,
    private articleService: ArticleService,
    private marqueService: MarqueService,
    private achatService: AchatService,
    private stockService: StockService,
    private importationService: ImportationService,
    private modeleBomService: ModeleBomService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.commandeId = idParam ? +idParam : 0;
    if (!this.commandeId) { return; }
    this.loadCommande();
    this.loadTailles();
    this.loadBom();
    this.loadModelesBom();
    this.loadResultat();
    this.loadStockVentile();
    this.articleService.getAll().subscribe({ next: (data) => this.articles = data, error: () => {} });
  }

  private loadCommande(): void {
    this.loading = true;
    this.commandeService.getById(this.commandeId).subscribe({
      next: (c) => {
        this.commande = c;
        this.pctSecurite = c.pctSecurite ?? 5;
        this.loading = false;
        if (c.marqueId) { this.loadMarque(c.marqueId); }
      },
      error: () => { this.loading = false; }
    });
  }

  // ÉTAPE 2 — Marque inclut plateforme via GET /api/Marque/{id}
  private loadMarque(marqueId: number): void {
    this.marqueService.getById(marqueId).subscribe({
      next: (m) => { this.marque = m; },
      error: () => {}
    });
  }

  // ÉTAPE 4 — Stock ventilé : forkJoin des 3 sources
  loadStockVentile(): void {
    this.loadingVentile = true;
    forkJoin({
      achats: this.achatService.getByCommande(this.commandeId),
      stocks: this.stockService.getStocksReserves(),
      importations: this.importationService.getAll()
    }).subscribe({
      next: ({ achats, stocks, importations }) => {
        this.achatsLies = achats;
        this.stockReserve = (stocks as any[]).filter(s => s.commandeClientId === this.commandeId);
        this.importationsLiees = (importations as any[]).filter(imp =>
          imp.lignesImportation?.some((l: any) => l.commandeClientId === this.commandeId)
        );
        this.loadingVentile = false;
      },
      error: () => { this.loadingVentile = false; }
    });
  }

  // --- Tailles ---
  loadTailles(): void {
    this.commandeService.getTailles(this.commandeId).subscribe({
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
    this.commandeService.setTailles(this.commandeId, valides).subscribe({
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
    this.commandeService.getBom(this.commandeId).subscribe({
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

  private loadModelesBom(): void {
    this.modeleBomService.getAll().subscribe({
      next: (data) => this.modelesBom = data,
      error: () => {}
    });
  }

  onModeleBomChange(id: number | null): void {
    if (!id) return;
    const modele = this.modelesBom.find(m => m.id === id);
    if (!modele?.fournitures?.length) return;
    this.bomLignes = modele.fournitures.map(f => ({
      articleId: f.articleId,
      quantiteParPiece: f.qteParPiece,
      unite: f.unite ?? ''
    }));
  }

  saveBom(): void {
    const valides = this.bomLignes.filter(b => b.articleId > 0 && b.quantiteParPiece > 0);
    if (valides.length === 0) {
      this.snackBar.open('Ajoutez au moins une fourniture avec un article et une quantité > 0', 'OK', { duration: 4000 });
      return;
    }
    this.savingBom = true;
    this.commandeService.setBom(this.commandeId, valides).subscribe({
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
    this.commandeService.updateCommande(this.commandeId, { ...this.commande, pctSecurite: this.pctSecurite }).pipe(
      switchMap(() => this.commandeService.calculer(this.commandeId, this.pctSecurite))
    ).subscribe({
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
    this.commandeService.getResultatCalcul(this.commandeId).subscribe({
      next: (data) => this.updateResultats(data),
      error: () => {}
    });
  }

  private updateResultats(data: ResultatCalcul[]): void {
    this.resultats = data;
    this.calculDone = data.length > 0;
    this.toutSuffisant = data.length > 0 && data.every(r => r.estSuffisant);
    this.manques = data.filter(r => !r.estSuffisant);
  }

  // ÉTAPE 3 — Séquence switchMap : tailles → BOM → pctSecurite → calculer → résultat
  verifierFaisabilite(): void {
    const taillesValides = this.tailles.filter(t => t.taille.trim() && t.quantite > 0);
    const bomValides = this.bomLignes.filter(b => b.articleId > 0 && b.quantiteParPiece > 0);
    if (taillesValides.length === 0) {
      this.snackBar.open('Ajoutez au moins une taille avec une quantité > 0', 'OK', { duration: 4000 });
      return;
    }
    this.verificationEnCours = true;
    this.commandeService.setTailles(this.commandeId, taillesValides).pipe(
      switchMap(() => this.commandeService.setBom(this.commandeId, bomValides)),
      switchMap(() => this.commandeService.updateCommande(this.commandeId, { ...this.commande, pctSecurite: this.pctSecurite })),
      switchMap(() => this.commandeService.calculer(this.commandeId, this.pctSecurite)),
      switchMap(() => this.commandeService.getResultatCalcul(this.commandeId))
    ).subscribe({
      next: (data) => {
        this.updateResultats(data as ResultatCalcul[]);
        this.verificationEnCours = false;
        this.snackBar.open('Faisabilité calculée', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erreur', 'Fermer', { duration: 5000 });
        this.verificationEnCours = false;
      }
    });
  }

  // ÉTAPE 5 — Helpers stock ventilé par article

  // Un entry par achat (somme des lignes pour cet article dans cet achat)
  getAchatsForArticle(articleId: number): { ref: string; fournisseur: string; quantite: number }[] {
    const byAchat = new Map<number, { ref: string; fournisseur: string; quantite: number }>();
    for (const achat of this.achatsLies) {
      const lignes: any[] = achat.lignesAchat || achat.lignes || [];
      const total = lignes
        .filter((l: any) => l.articleId === articleId)
        .reduce((s: number, l: any) => s + (l.quantite || 0), 0);
      if (total > 0) {
        byAchat.set(achat.id ?? achat.referenceAchat, {
          ref: achat.referenceAchat || achat.reference || '—',
          fournisseur: achat.fournisseur?.nom || achat.fournisseur?.raisonSociale || '',
          quantite: total
        });
      }
    }
    return [...byAchat.values()];
  }

  // Un entry par lot de stock réservé
  getStockForArticle(articleId: number): any[] {
    return this.stockReserve.filter(s => s.articleId === articleId);
  }

  // Un entry par importation (somme des lignes liées à cette commande pour cet article)
  getImportationsForArticle(articleId: number): { ref: string; date: string | null; quantite: number }[] {
    const result: { ref: string; date: string | null; quantite: number }[] = [];
    for (const imp of this.importationsLiees) {
      const lignes: any[] = (imp.lignesImportation || []).filter(
        (l: any) => l.articleId === articleId && l.commandeClientId === this.commandeId
      );
      const total = lignes.reduce((s: number, l: any) => s + (l.quantite || 0), 0);
      if (total > 0) {
        result.push({
          ref: imp.referenceImportation || imp.reference || '—',
          date: imp.dateImportation || null,
          quantite: total
        });
      }
    }
    return result;
  }

  getSubtotal(items: { quantite: number }[]): number {
    return items.reduce((s, i) => s + i.quantite, 0);
  }

  hasVentileData(articleId: number): boolean {
    return this.getAchatsForArticle(articleId).length > 0 ||
           this.getStockForArticle(articleId).length > 0 ||
           this.getImportationsForArticle(articleId).length > 0;
  }

  // --- Navigation ---
  lancerCommande(): void {
    this.isLancing = true;
    this.commandeService.genererTaches(this.commandeId).subscribe({
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
    this.router.navigate(['/commandes/edit', this.commandeId]);
  }

  goBack(): void {
    this.router.navigate(['/commandes']);
  }
}
