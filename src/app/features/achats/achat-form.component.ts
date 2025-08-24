import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, ActivatedRoute } from '@angular/router';

import { AchatService, Achat, LigneAchat } from '../../core/services/achat.service';
import { FournisseurService } from '../../core/services/fournisseur.service';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-achat-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatExpansionModule
  ],
  template: `
    <div class="achat-form-container">
    <mat-card>
      <mat-card-header>
          <mat-card-title>
            <mat-icon>shopping_cart</mat-icon>
            {{ isEditMode ? 'Modifier' : 'Nouveau' }} Achat
          </mat-card-title>
          <mat-card-subtitle>
            Gestion des achats et commandes fournisseurs
          </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="achatForm" (ngSubmit)="onSubmit()">
            <!-- Informations générales -->
            <div class="form-section">
              <h3>Informations Générales</h3>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Référence Achat</mat-label>
                  <input matInput formControlName="referenceAchat" placeholder="REF-ACH-2024-001">
                  <mat-icon matSuffix>assignment</mat-icon>
          </mat-form-field>

                <mat-form-field appearance="outline">
            <mat-label>Fournisseur</mat-label>
                  <mat-select formControlName="fournisseurId" (selectionChange)="onFournisseurChange()">
              <mat-option *ngFor="let fournisseur of fournisseurs" [value]="fournisseur.id">
                      {{ fournisseur.nom }} - {{ fournisseur.code }}
              </mat-option>
            </mat-select>
                  <mat-icon matSuffix>business</mat-icon>
          </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Date d'Achat</mat-label>
                  <input matInput [matDatepicker]="pickerAchat" formControlName="dateAchat">
                  <mat-datepicker-toggle matSuffix [for]="pickerAchat"></mat-datepicker-toggle>
                  <mat-datepicker #pickerAchat></mat-datepicker>
          </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Date Livraison Prévue</mat-label>
                  <input matInput [matDatepicker]="pickerLivraison" formControlName="dateLivraisonPrevue">
                  <mat-datepicker-toggle matSuffix [for]="pickerLivraison"></mat-datepicker-toggle>
                  <mat-datepicker #pickerLivraison></mat-datepicker>
          </mat-form-field>

                <mat-form-field appearance="outline">
            <mat-label>Statut</mat-label>
                  <mat-select formControlName="statut">
                    <mat-option value="Brouillon">Brouillon</mat-option>
              <mat-option value="EnAttente">En Attente</mat-option>
                    <mat-option value="Validee">Validée</mat-option>
                    <mat-option value="EnLivraison">En Livraison</mat-option>
                    <mat-option value="Livree">Livrée</mat-option>
                    <mat-option value="Annulee">Annulée</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>pending</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Mode de Paiement</mat-label>
                  <mat-select formControlName="modePaiement">
                    <mat-option value="Virement">Virement</mat-option>
                    <mat-option value="Cheque">Chèque</mat-option>
                    <mat-option value="Especes">Espèces</mat-option>
                    <mat-option value="Carte">Carte</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>payment</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Conditions de paiement -->
            <div class="form-section">
              <h3>Conditions de Paiement</h3>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Conditions de Paiement</mat-label>
                  <input matInput formControlName="conditionsPaiement" placeholder="30 jours fin de mois">
                  <mat-icon matSuffix>schedule</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Taux de TVA (%)</mat-label>
                  <input matInput type="number" formControlName="tauxTVA" min="0" max="100" step="0.1" (input)="onTauxTVAChange()">
                  <mat-icon matSuffix>percent</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Lignes d'achat -->
            <div class="form-section">
              <div class="section-header">
                <h3>Articles Achetés</h3>
                <button mat-raised-button color="primary" type="button" (click)="addLigne()">
                  <mat-icon>add</mat-icon>
                  Ajouter Article
                </button>
              </div>

              <div formArrayName="lignesAchat">
                <div *ngFor="let ligne of lignesAchatArray.controls; let i = index" [formGroupName]="i" class="ligne-item">
                  <div class="ligne-header">
                    <h4>Article {{ i + 1 }}</h4>
                    <button mat-icon-button color="warn" type="button" (click)="removeLigne(i)" [disabled]="lignesAchatArray.length === 1">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>

                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Article</mat-label>
                      <mat-select formControlName="articleId" (selectionChange)="onArticleChange(i)">
                        <mat-option *ngFor="let article of articles" [value]="article.id">
                          {{ article.nom }} - {{ article.reference }}
                        </mat-option>
            </mat-select>
          </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Quantité</mat-label>
                      <input matInput type="number" formControlName="quantite" min="1" (input)="calculateLigneMontants(i)">
                      <mat-icon matSuffix>inventory</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Prix Unitaire HT</mat-label>
                      <input matInput type="number" formControlName="prixUnitaire" min="0" step="0.01" (input)="calculateLigneMontants(i)">
                      <mat-icon matSuffix>euro</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Montant HT</mat-label>
                      <input matInput type="number" formControlName="montantHT" readonly>
                      <mat-icon matSuffix>calculate</mat-icon>
          </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Montant TVA</mat-label>
                      <input matInput type="number" formControlName="montantTVA" readonly>
                      <mat-icon matSuffix>receipt</mat-icon>
          </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Montant TTC</mat-label>
                      <input matInput type="number" formControlName="montantTTC" readonly>
                      <mat-icon matSuffix>account_balance_wallet</mat-icon>
                    </mat-form-field>
                  </div>
                </div>
              </div>
            </div>

            <!-- Informations du fournisseur sélectionné -->
            <div *ngIf="selectedFournisseur" class="form-section">
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>info</mat-icon>
                    Informations Fournisseur
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <div class="fournisseur-info">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">Code :</span>
                      <span class="value">{{ selectedFournisseur.code }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Adresse :</span>
                      <span class="value">{{ selectedFournisseur.adresse }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Téléphone :</span>
                      <span class="value">{{ selectedFournisseur.telephone }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Email :</span>
                      <span class="value">{{ selectedFournisseur.email }}</span>
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
            </div>

            <!-- Résumé financier -->
            <div class="form-section summary">
              <h3>Résumé Financier</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Nombre d'articles:</span>
                  <span class="value">{{ lignesAchatArray.length }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Montant HT:</span>
                  <span class="value">{{ getMontantHT() | currency:'EUR' }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Montant TVA:</span>
                  <span class="value">{{ getMontantTVA() | currency:'EUR' }}</span>
                </div>
                <div class="summary-item total">
                  <span class="label">Montant TTC:</span>
                  <span class="value">{{ getMontantTTC() | currency:'EUR' }}</span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-section">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="3" placeholder="Notes additionnelles..."></textarea>
          </mat-form-field>
            </div>

            <!-- Actions -->
          <div class="form-actions">
            <button mat-button type="button" (click)="onCancel()">
                <mat-icon>cancel</mat-icon>
              Annuler
            </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!achatForm.valid || isSubmitting">
                <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
                <span *ngIf="!isSubmitting">
                  <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                  {{ isEditMode ? 'Modifier' : 'Créer' }}
                </span>
              </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
    </div>
  `,
  styles: [`
    .achat-form-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .form-section {
      margin-bottom: 30px;
    }

    .form-section h3 {
      margin-bottom: 16px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .ligne-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      background-color: #fafafa;
    }

    .ligne-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .ligne-header h4 {
      margin: 0;
      color: #1976d2;
    }

    .fournisseur-info {
      padding: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
    }

    .info-item .label {
      font-weight: 500;
      color: #666;
    }

    .info-item .value {
      font-weight: 600;
      color: #1976d2;
    }

    .summary {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
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
      padding: 8px 0;
    }

    .summary-item.total {
      border-top: 2px solid #1976d2;
      padding-top: 12px;
      margin-top: 8px;
      font-weight: bold;
      font-size: 1.1em;
    }

    .summary-item .label {
      font-weight: 500;
      color: #666;
    }

    .summary-item .value {
      font-weight: 600;
      color: #1976d2;
    }

    .summary-item.total .value {
      color: #1976d2;
      font-size: 1.2em;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .full-width {
      width: 100%;
    }

    mat-divider {
      margin: 30px 0;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .section-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }
    }
  `]
})
export class AchatFormComponent implements OnInit {
  achatForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  achatId: number | null = null;

  fournisseurs: any[] = [];
  articles: any[] = [];
  selectedFournisseur: any = null;

  constructor(
    private fb: FormBuilder,
    private achatService: AchatService,
    private fournisseurService: FournisseurService,
    private articleService: ArticleService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.achatForm = this.fb.group({
      referenceAchat: ['', Validators.required],
      fournisseurId: ['', Validators.required],
      dateAchat: [new Date(), Validators.required],
      dateLivraisonPrevue: [''],
      statut: ['Brouillon', Validators.required],
      modePaiement: ['Virement', Validators.required],
      conditionsPaiement: ['30 jours fin de mois'],
      tauxTVA: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
      notes: [''],
      lignesAchat: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadFournisseurs();
    this.loadArticles();
    this.addLigne(); // Ajouter une ligne par défaut

    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.achatId = +params['id'];
        this.loadAchat(this.achatId);
      }
    });
  }

  get lignesAchatArray(): FormArray {
    return this.achatForm.get('lignesAchat') as FormArray;
  }

  addLigne(): void {
    const ligne = this.fb.group({
      articleId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      montantHT: [0, Validators.required],
      montantTVA: [0, Validators.required],
      montantTTC: [0, Validators.required]
    });

    this.lignesAchatArray.push(ligne);
  }

  removeLigne(index: number): void {
    if (this.lignesAchatArray.length > 1) {
      this.lignesAchatArray.removeAt(index);
    }
  }

  calculateLigneMontants(index: number): void {
    const ligne = this.lignesAchatArray.at(index);
    const quantite = ligne.get('quantite')?.value || 0;
    const prixUnitaire = ligne.get('prixUnitaire')?.value || 0;
    const tauxTVA = this.achatForm.get('tauxTVA')?.value || 20;

    const montantHT = quantite * prixUnitaire;
    const montantTVA = montantHT * (tauxTVA / 100);
    const montantTTC = montantHT + montantTVA;

    ligne.patchValue({
      montantHT,
      montantTVA,
      montantTTC
    }, { emitEvent: false });
  }

  onTauxTVAChange(): void {
    // Recalculer tous les montants quand le taux de TVA change
    for (let i = 0; i < this.lignesAchatArray.length; i++) {
      this.calculateLigneMontants(i);
    }
  }

  getMontantHT(): number {
    return this.lignesAchatArray.controls.reduce((total, control) => {
      return total + (control.get('montantHT')?.value || 0);
    }, 0);
  }

  getMontantTVA(): number {
    return this.lignesAchatArray.controls.reduce((total, control) => {
      return total + (control.get('montantTVA')?.value || 0);
    }, 0);
  }

  getMontantTTC(): number {
    return this.lignesAchatArray.controls.reduce((total, control) => {
      return total + (control.get('montantTTC')?.value || 0);
    }, 0);
  }

  loadFournisseurs(): void {
    this.fournisseurService.getAll().subscribe({
      next: (fournisseurs) => {
        this.fournisseurs = fournisseurs;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des fournisseurs:', error);
        this.snackBar.open('Erreur lors du chargement des fournisseurs', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadArticles(): void {
    this.articleService.getAll().subscribe({
      next: (articles) => {
        this.articles = articles;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des articles:', error);
        this.snackBar.open('Erreur lors du chargement des articles', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadAchat(id: number): void {
    this.achatService.getById(id).subscribe({
      next: (achat) => {
        this.achatForm.patchValue({
          referenceAchat: achat.referenceAchat,
          fournisseurId: achat.fournisseurId,
          dateAchat: new Date(achat.dateAchat),
          dateLivraisonPrevue: achat.dateLivraisonPrevue ? new Date(achat.dateLivraisonPrevue) : null,
          statut: achat.statut,
          modePaiement: achat.modePaiement,
          conditionsPaiement: achat.conditionsPaiement,
          tauxTVA: achat.tauxTVA,
          notes: achat.notes
        });

        // Charger les lignes d'achat
        this.lignesAchatArray.clear();
        achat.lignesAchat?.forEach(ligne => {
          const ligneGroup = this.fb.group({
            articleId: [ligne.articleId, Validators.required],
            quantite: [ligne.quantite, [Validators.required, Validators.min(1)]],
            prixUnitaire: [ligne.prixUnitaire, [Validators.required, Validators.min(0)]],
            montantHT: [ligne.montantHT, Validators.required],
            montantTVA: [ligne.montantTVA, Validators.required],
            montantTTC: [ligne.montantTTC, Validators.required]
          });
          this.lignesAchatArray.push(ligneGroup);
        });

        this.onFournisseurChange();
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'achat:', error);
        this.snackBar.open('Erreur lors du chargement de l\'achat', 'Fermer', { duration: 3000 });
      }
    });
  }

  onFournisseurChange(): void {
    const fournisseurId = this.achatForm.get('fournisseurId')?.value;
    if (fournisseurId) {
      this.selectedFournisseur = this.fournisseurs.find(f => f.id === fournisseurId);
    } else {
      this.selectedFournisseur = null;
    }
  }

  onArticleChange(index: number): void {
    const ligne = this.lignesAchatArray.at(index);
    const articleId = ligne.get('articleId')?.value;
    if (articleId) {
      const article = this.articles.find(a => a.id === articleId);
      if (article && !this.isEditMode) {
        // Suggérer le prix d'achat comme prix unitaire par défaut
        ligne.patchValue({
          prixUnitaire: article.prixAchat || 0
        });
        this.calculateLigneMontants(index);
      }
    }
  }

  onSubmit(): void {
    if (this.achatForm.valid) {
      this.isSubmitting = true;

      const achatData: Achat = {
        ...this.achatForm.value,
        montantTotal: this.getMontantTTC(),
        montantHT: this.getMontantHT(),
        montantTVA: this.getMontantTVA()
      };

      const request = this.isEditMode && this.achatId
        ? this.achatService.update(this.achatId, achatData)
        : this.achatService.create(achatData);

      request.subscribe({
        next: (result) => {
          this.snackBar.open(
            `Achat ${this.isEditMode ? 'modifié' : 'créé'} avec succès`,
            'Fermer',
            { duration: 3000 }
          );
      this.router.navigate(['/achats']);
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/achats']);
  }
}
