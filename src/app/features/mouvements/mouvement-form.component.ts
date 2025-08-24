import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

import { MouvementService, MouvementStock } from '../../core/services/mouvement.service';
import { ArticleService } from '../../core/services/article.service';
import { EmplacementService } from '../../core/services/emplacement.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mouvement-form',
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
    <div class="mouvement-form-container">
    <mat-card>
      <mat-card-header>
          <mat-card-title>
            <mat-icon>swap_horiz</mat-icon>
            {{ isEditMode ? 'Modifier' : 'Nouveau' }} Mouvement de Stock
          </mat-card-title>
          <mat-card-subtitle>
            Gestion des entrées, sorties et transferts de stock
          </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="mouvementForm" (ngSubmit)="onSubmit()">
            <!-- Type de mouvement -->
            <div class="form-section">
              <h3>Type de Mouvement</h3>
              <div class="type-selection">
          <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Type de Mouvement</mat-label>
                  <mat-select formControlName="typeMouvement" (selectionChange)="onTypeChange()">
                    <mat-option value="Entree">
                      <mat-icon>input</mat-icon>
                      Entrée de Stock
                    </mat-option>
                    <mat-option value="Sortie">
                      <mat-icon>output</mat-icon>
                      Sortie de Stock
                    </mat-option>
                    <mat-option value="Transfert">
                      <mat-icon>swap_horiz</mat-icon>
                      Transfert
                    </mat-option>
                    <mat-option value="Ajustement">
                      <mat-icon>tune</mat-icon>
                      Ajustement
              </mat-option>
            </mat-select>
                  <mat-icon matSuffix>category</mat-icon>
          </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Informations générales -->
            <div class="form-section">
              <h3>Informations Générales</h3>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Article</mat-label>
                  <mat-select formControlName="articleId" (selectionChange)="onArticleChange()">
                    <mat-option *ngFor="let article of articles" [value]="article.id">
                      {{ article.nom }} - {{ article.reference }}
                    </mat-option>
            </mat-select>
                  <mat-icon matSuffix>inventory</mat-icon>
          </mat-form-field>

                <mat-form-field appearance="outline">
            <mat-label>Quantité</mat-label>
                  <input matInput type="number" formControlName="quantite" min="1" (input)="onQuantiteChange()">
                  <mat-icon matSuffix>straighten</mat-icon>
          </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Date de Mouvement</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="dateMouvement">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Motif</mat-label>
                  <input matInput formControlName="motif" placeholder="Raison du mouvement...">
                  <mat-icon matSuffix>description</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Référence Document</mat-label>
                  <input matInput formControlName="referenceDocument" placeholder="REF-DOC-2024-001">
                  <mat-icon matSuffix>assignment</mat-icon>
          </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Statut</mat-label>
                  <mat-select formControlName="statut">
                    <mat-option value="EnAttente">En Attente</mat-option>
                    <mat-option value="Valide">Validé</mat-option>
                    <mat-option value="Annule">Annulé</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>pending</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Emplacements -->
            <div class="form-section">
              <h3>Emplacements</h3>
              <div class="form-grid">
                <!-- Emplacement Source (pour Sortie et Transfert) -->
                <mat-form-field appearance="outline" *ngIf="showEmplacementSource">
                  <mat-label>Emplacement Source</mat-label>
                  <mat-select formControlName="emplacementSourceId" (selectionChange)="onEmplacementSourceChange()">
                    <mat-option *ngFor="let emplacement of emplacements" [value]="emplacement.id">
                      {{ emplacement.nom }} - {{ emplacement.description }}
                    </mat-option>
            </mat-select>
                  <mat-icon matSuffix>location_on</mat-icon>
          </mat-form-field>

                <!-- Emplacement Destination (pour Entrée et Transfert) -->
                <mat-form-field appearance="outline" *ngIf="showEmplacementDestination">
                  <mat-label>Emplacement Destination</mat-label>
                  <mat-select formControlName="emplacementDestinationId" (selectionChange)="onEmplacementDestinationChange()">
                    <mat-option *ngFor="let emplacement of emplacements" [value]="emplacement.id">
                      {{ emplacement.nom }} - {{ emplacement.description }}
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>location_on</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <!-- Informations de l'article sélectionné -->
            <div *ngIf="selectedArticle" class="form-section">
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>info</mat-icon>
                    Informations Article
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <div class="article-info">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">Référence :</span>
                      <span class="value">{{ selectedArticle.reference }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Catégorie :</span>
                      <span class="value">{{ selectedArticle.categorie?.nom || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Stock actuel :</span>
                      <span class="value">{{ selectedArticle.quantiteStock || 0 }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Stock minimum :</span>
                      <span class="value">{{ selectedArticle.stockMinimum || 0 }}</span>
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
            </div>

            <!-- Validation de stock -->
            <div *ngIf="showStockValidation" class="form-section">
              <mat-card class="validation-card" [ngClass]="{'warning': !stockDisponible, 'success': stockDisponible}">
                <mat-card-content>
                  <div class="validation-content">
                    <mat-icon>{{ stockDisponible ? 'check_circle' : 'warning' }}</mat-icon>
                    <div class="validation-text">
                      <h4>{{ stockDisponible ? 'Stock disponible' : 'Stock insuffisant' }}</h4>
                      <p *ngIf="!stockDisponible">
                        Stock disponible : {{ stockDisponibleQuantite }} |
                        Quantité demandée : {{ mouvementForm.get('quantite')?.value }}
                      </p>
                      <p *ngIf="stockDisponible">
                        Le stock est suffisant pour cette opération.
                      </p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
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
              <button mat-raised-button color="primary" type="submit" [disabled]="!mouvementForm.valid || isSubmitting || (!stockDisponible && showStockValidation)">
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
    .mouvement-form-container {
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

    .type-selection {
      margin-bottom: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .article-info {
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
      padding: 8px 0;
    }

    .info-item .label {
      font-weight: 500;
      color: #666;
    }

    .info-item .value {
      font-weight: 600;
      color: #1976d2;
    }

    .validation-card {
      margin-top: 16px;
    }

    .validation-card.warning {
      border-left: 4px solid #f57c00;
      background-color: #fff3e0;
    }

    .validation-card.success {
      border-left: 4px solid #388e3c;
      background-color: #e8f5e8;
    }

    .validation-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .validation-content mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .validation-text h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .validation-text p {
      margin: 0;
      color: #666;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
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

      .form-actions {
        flex-direction: column;
      }

      .validation-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class MouvementFormComponent implements OnInit {
  mouvementForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  mouvementId: number | null = null;

  articles: any[] = [];
  emplacements: any[] = [];
  selectedArticle: any = null;
  stockDisponible = true;
  stockDisponibleQuantite = 0;
  showStockValidation = false;

  constructor(
    private fb: FormBuilder,
    private mouvementService: MouvementService,
    private articleService: ArticleService,
    private emplacementService: EmplacementService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.mouvementForm = this.fb.group({
      typeMouvement: ['', Validators.required],
      articleId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      dateMouvement: [new Date(), Validators.required],
      motif: ['', Validators.required],
      referenceDocument: [''],
      emplacementSourceId: [''],
      emplacementDestinationId: [''],
      statut: ['EnAttente', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadArticles();
    this.loadEmplacements();

    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.mouvementId = +params['id'];
        this.loadMouvement(this.mouvementId);
      }
    });

    // Écouter les changements de type de mouvement
    this.mouvementForm.get('typeMouvement')?.valueChanges.subscribe(() => {
      this.onTypeChange();
    });
  }

  get showEmplacementSource(): boolean {
    const type = this.mouvementForm.get('typeMouvement')?.value;
    return type === 'Sortie' || type === 'Transfert';
  }

  get showEmplacementDestination(): boolean {
    const type = this.mouvementForm.get('typeMouvement')?.value;
    return type === 'Entree' || type === 'Transfert';
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

  loadEmplacements(): void {
    this.emplacementService.getAll().subscribe({
      next: (emplacements) => {
        this.emplacements = emplacements;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des emplacements:', error);
        this.snackBar.open('Erreur lors du chargement des emplacements', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadMouvement(id: number): void {
    this.mouvementService.getById(id).subscribe({
      next: (mouvement) => {
        this.mouvementForm.patchValue({
          typeMouvement: mouvement.typeMouvement,
          articleId: mouvement.articleId,
          quantite: mouvement.quantite,
          dateMouvement: new Date(mouvement.dateMouvement),
          motif: mouvement.motif,
          referenceDocument: mouvement.referenceDocument,
          emplacementSourceId: mouvement.emplacementSourceId,
          emplacementDestinationId: mouvement.emplacementDestinationId,
          statut: mouvement.statut,
          notes: mouvement.notes
        });
        this.onTypeChange();
        this.onArticleChange();
      },
      error: (error) => {
        console.error('Erreur lors du chargement du mouvement:', error);
        this.snackBar.open('Erreur lors du chargement du mouvement', 'Fermer', { duration: 3000 });
      }
    });
  }

  onTypeChange(): void {
    const type = this.mouvementForm.get('typeMouvement')?.value;

    // Réinitialiser les emplacements selon le type
    if (type === 'Entree') {
      this.mouvementForm.patchValue({
        emplacementSourceId: '',
        emplacementDestinationId: ''
      });
    } else if (type === 'Sortie') {
      this.mouvementForm.patchValue({
        emplacementSourceId: '',
        emplacementDestinationId: ''
      });
    } else if (type === 'Transfert') {
      this.mouvementForm.patchValue({
        emplacementSourceId: '',
        emplacementDestinationId: ''
      });
    }

    // Vérifier le stock si nécessaire
    this.checkStockAvailability();
  }

  onArticleChange(): void {
    const articleId = this.mouvementForm.get('articleId')?.value;
    if (articleId) {
      this.selectedArticle = this.articles.find(a => a.id === articleId);
      this.checkStockAvailability();
    } else {
      this.selectedArticle = null;
      this.showStockValidation = false;
    }
  }

  onQuantiteChange(): void {
    this.checkStockAvailability();
  }

  onEmplacementSourceChange(): void {
    this.checkStockAvailability();
  }

  onEmplacementDestinationChange(): void {
    // Pour les transferts, on peut vérifier la capacité de destination
  }

  checkStockAvailability(): void {
    const type = this.mouvementForm.get('typeMouvement')?.value;
    const articleId = this.mouvementForm.get('articleId')?.value;
    const quantite = this.mouvementForm.get('quantite')?.value;
    const emplacementSourceId = this.mouvementForm.get('emplacementSourceId')?.value;

    if (type === 'Sortie' || type === 'Transfert') {
      if (articleId && quantite && emplacementSourceId) {
        this.mouvementService.checkStockDisponible(articleId, emplacementSourceId, quantite).subscribe({
          next: (disponible) => {
            this.stockDisponible = disponible;
            this.showStockValidation = true;
            // Récupérer la quantité disponible
            this.stockDisponibleQuantite = this.selectedArticle?.quantiteStock || 0;
          },
          error: (error) => {
            console.error('Erreur lors de la vérification du stock:', error);
            this.stockDisponible = true; // Par défaut, on autorise
            this.showStockValidation = false;
          }
        });
      } else {
        this.showStockValidation = false;
      }
    } else {
      this.showStockValidation = false;
    }
  }

  onSubmit(): void {
    if (this.mouvementForm.valid) {
      this.isSubmitting = true;

      const currentUser = this.authService.getCurrentUser();
      const mouvementData: MouvementStock = {
        ...this.mouvementForm.value,
        utilisateurId: currentUser ? currentUser.id : 0
      };

      const request = this.isEditMode && this.mouvementId
        ? this.mouvementService.update(this.mouvementId, mouvementData)
        : this.mouvementService.create(mouvementData);

      request.subscribe({
        next: (result) => {
          this.snackBar.open(
            `Mouvement ${this.isEditMode ? 'modifié' : 'créé'} avec succès`,
            'Fermer',
            { duration: 3000 }
          );
      this.router.navigate(['/mouvements']);
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
    this.router.navigate(['/mouvements']);
  }
}
