import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';

import { LigneAchat } from '../../core/services/achat.service';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-ligne-achat',
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
    MatSnackBarModule,
    MatExpansionModule
  ],
  template: `
    <mat-expansion-panel [expanded]="isExpanded" class="ligne-panel">
      <mat-expansion-panel-header>
        <mat-panel-title>
          <mat-icon>shopping_basket</mat-icon>
          Ligne {{ index + 1 }} - {{ getArticleName() }}
        </mat-panel-title>
        <mat-panel-description>
          {{ ligneForm.get('quantite')?.value || 0 }} x {{ ligneForm.get('prixUnitaire')?.value || 0 | currency:'EUR' }} = {{ getMontantTTC() | currency:'EUR' }}
        </mat-panel-description>
      </mat-expansion-panel-header>

      <form [formGroup]="ligneForm" (ngSubmit)="onSubmit()">
        <div class="ligne-form-grid">
          <!-- Article -->
          <mat-form-field appearance="outline">
            <mat-label>Article</mat-label>
            <mat-select formControlName="articleId" (selectionChange)="onArticleChange()">
              <mat-option *ngFor="let article of articles" [value]="article.id">
                {{ article.nom }} - {{ article.reference }}
              </mat-option>
            </mat-select>
            <mat-icon matSuffix>category</mat-icon>
            <mat-error *ngIf="ligneForm.get('articleId')?.hasError('required')">
              L'article est requis
            </mat-error>
          </mat-form-field>

          <!-- Quantité -->
          <mat-form-field appearance="outline">
            <mat-label>Quantité</mat-label>
            <input matInput type="number" formControlName="quantite" min="1" (input)="calculateMontants()">
            <mat-icon matSuffix>inventory</mat-icon>
            <mat-error *ngIf="ligneForm.get('quantite')?.hasError('required')">
              La quantité est requise
            </mat-error>
            <mat-error *ngIf="ligneForm.get('quantite')?.hasError('min')">
              La quantité doit être supérieure à 0
            </mat-error>
          </mat-form-field>

          <!-- Prix Unitaire -->
          <mat-form-field appearance="outline">
            <mat-label>Prix Unitaire HT</mat-label>
            <input matInput type="number" formControlName="prixUnitaire" min="0" step="0.01" (input)="calculateMontants()">
            <mat-icon matSuffix>euro</mat-icon>
            <mat-error *ngIf="ligneForm.get('prixUnitaire')?.hasError('required')">
              Le prix unitaire est requis
            </mat-error>
            <mat-error *ngIf="ligneForm.get('prixUnitaire')?.hasError('min')">
              Le prix doit être positif
            </mat-error>
          </mat-form-field>

          <!-- Montant HT (calculé automatiquement) -->
          <mat-form-field appearance="outline">
            <mat-label>Montant HT</mat-label>
            <input matInput type="number" formControlName="montantHT" readonly>
            <mat-icon matSuffix>calculate</mat-icon>
          </mat-form-field>

          <!-- Montant TVA (calculé automatiquement) -->
          <mat-form-field appearance="outline">
            <mat-label>Montant TVA</mat-label>
            <input matInput type="number" formControlName="montantTVA" readonly>
            <mat-icon matSuffix>receipt</mat-icon>
          </mat-form-field>

          <!-- Montant TTC (calculé automatiquement) -->
          <mat-form-field appearance="outline">
            <mat-label>Montant TTC</mat-label>
            <input matInput type="number" formControlName="montantTTC" readonly>
            <mat-icon matSuffix>account_balance_wallet</mat-icon>
          </mat-form-field>
        </div>

        <!-- Informations de l'article sélectionné -->
        <div *ngIf="selectedArticle" class="article-info">
          <mat-card class="info-card">
            <mat-card-content>
              <div class="article-details">
                <div class="detail-item">
                  <span class="label">Référence :</span>
                  <span class="value">{{ selectedArticle.reference }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Catégorie :</span>
                  <span class="value">{{ selectedArticle.categorie?.nom || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Prix d'achat suggéré :</span>
                  <span class="value">{{ selectedArticle.prixAchat | currency:'EUR' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Prix de vente :</span>
                  <span class="value">{{ selectedArticle.prixVente | currency:'EUR' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Stock actuel :</span>
                  <span class="value">{{ selectedArticle.quantiteStock || 0 }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Actions -->
        <div class="ligne-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="!ligneForm.valid || isSubmitting">
            <mat-icon>save</mat-icon>
            {{ isEditMode ? 'Modifier' : 'Ajouter' }}
          </button>
          <button mat-button type="button" (click)="onCancel()">
            <mat-icon>cancel</mat-icon>
            Annuler
          </button>
          <button *ngIf="isEditMode" mat-button color="warn" type="button" (click)="onDelete()">
            <mat-icon>delete</mat-icon>
            Supprimer
          </button>
        </div>
      </form>
    </mat-expansion-panel>
  `,
  styles: [`
    .ligne-panel {
      margin-bottom: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .ligne-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .article-info {
      margin-bottom: 20px;
    }

    .info-card {
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
    }

    .article-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
    }

    .detail-item .label {
      font-weight: 500;
      color: #666;
    }

    .detail-item .value {
      font-weight: 600;
      color: #1976d2;
    }

    .ligne-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    @media (max-width: 768px) {
      .ligne-form-grid {
        grid-template-columns: 1fr;
      }

      .article-details {
        grid-template-columns: 1fr;
      }

      .ligne-actions {
        flex-direction: column;
      }
    }
  `]
})
export class LigneAchatComponent implements OnInit {
  @Input() ligne: LigneAchat | null = null;
  @Input() index: number = 0;
  @Input() isEditMode: boolean = false;
  @Input() isExpanded: boolean = false;
  @Input() tauxTVA: number = 20;
  
  @Output() save = new EventEmitter<LigneAchat>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<number>();

  ligneForm: FormGroup;
  isSubmitting = false;
  articles: any[] = [];
  selectedArticle: any = null;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private snackBar: MatSnackBar
  ) {
    this.ligneForm = this.fb.group({
      articleId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      montantHT: [0, Validators.required],
      montantTVA: [0, Validators.required],
      montantTTC: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadArticles();
    this.initializeForm();
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

  initializeForm(): void {
    if (this.ligne) {
      this.ligneForm.patchValue({
        articleId: this.ligne.articleId,
        quantite: this.ligne.quantite,
        prixUnitaire: this.ligne.prixUnitaire,
        montantHT: this.ligne.montantHT,
        montantTVA: this.ligne.montantTVA,
        montantTTC: this.ligne.montantTTC
      });
      this.onArticleChange();
    }
  }

  onArticleChange(): void {
    const articleId = this.ligneForm.get('articleId')?.value;
    if (articleId) {
      this.selectedArticle = this.articles.find(a => a.id === articleId);
      if (this.selectedArticle && !this.isEditMode) {
        // Suggérer le prix d'achat comme prix unitaire par défaut
        this.ligneForm.patchValue({
          prixUnitaire: this.selectedArticle.prixAchat || 0
        });
        this.calculateMontants();
      }
    } else {
      this.selectedArticle = null;
    }
  }

  calculateMontants(): void {
    const quantite = this.ligneForm.get('quantite')?.value || 0;
    const prixUnitaire = this.ligneForm.get('prixUnitaire')?.value || 0;
    const montantHT = quantite * prixUnitaire;
    const montantTVA = montantHT * (this.tauxTVA / 100);
    const montantTTC = montantHT + montantTVA;
    
    this.ligneForm.patchValue({
      montantHT,
      montantTVA,
      montantTTC
    }, { emitEvent: false });
  }

  getMontantTTC(): number {
    return this.ligneForm.get('montantTTC')?.value || 0;
  }

  getArticleName(): string {
    const articleId = this.ligneForm.get('articleId')?.value;
    if (articleId) {
      const article = this.articles.find(a => a.id === articleId);
      return article ? article.nom : 'Article non sélectionné';
    }
    return 'Article non sélectionné';
  }

  onSubmit(): void {
    if (this.ligneForm.valid) {
      this.isSubmitting = true;
      
      const ligneData: LigneAchat = {
        ...this.ligneForm.value,
        id: this.ligne?.id,
        achatId: this.ligne?.achatId || 0
      };

      this.save.emit(ligneData);
      this.isSubmitting = false;
    } else {
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', { duration: 3000 });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onDelete(): void {
    if (this.ligne?.id) {
      this.delete.emit(this.ligne.id);
    }
  }
} 