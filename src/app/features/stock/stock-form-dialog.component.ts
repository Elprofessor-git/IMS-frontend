import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Article } from './stock.service';
import { Stock } from '../../shared/models/stock.model';

export interface IStockFormData {
  stock?: Stock;
  articles: Article[];
  isEdit: boolean;
}

@Component({
  selector: 'app-stock-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.isEdit ? 'Modifier' : 'Ajouter' }} un article au stock
    </h2>

    <form [formGroup]="stockForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Article</mat-label>
            <mat-select formControlName="articleId" required>
              <mat-option *ngFor="let article of data.articles" [value]="article.id">
                {{ article.nom }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="stockForm.get('articleId')?.hasError('required')">
              L'article est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Quantité</mat-label>
            <input matInput type="number" formControlName="quantite" min="0" step="0.01">
            <mat-error *ngIf="stockForm.get('quantite')?.hasError('required')">
              La quantité est requise
            </mat-error>
            <mat-error *ngIf="stockForm.get('quantite')?.hasError('min')">
              La quantité doit être positive
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Quantité Réservée</mat-label>
            <input matInput type="number" formControlName="quantiteReservee" min="0" step="0.01">
            <mat-error *ngIf="stockForm.get('quantiteReservee')?.hasError('min')">
              La quantité réservée doit être positive
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Prix Unitaire (€)</mat-label>
            <input matInput type="number" formControlName="prixUnitaire" min="0" step="0.01">
            <mat-error *ngIf="stockForm.get('prixUnitaire')?.hasError('required')">
              Le prix unitaire est requis
            </mat-error>
            <mat-error *ngIf="stockForm.get('prixUnitaire')?.hasError('min')">
              Le prix doit être positif
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type de Stock</mat-label>
            <mat-select formControlName="typeStock" required>
              <mat-option value="MatierePremiere">Matière Première</mat-option>
              <mat-option value="ProduitFini">Produit Fini</mat-option>
              <mat-option value="Emballage">Emballage</mat-option>
              <mat-option value="Consommable">Consommable</mat-option>
            </mat-select>
            <mat-error *ngIf="stockForm.get('typeStock')?.hasError('required')">
              Le type de stock est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Localisation</mat-label>
            <input matInput formControlName="localisation">
            <mat-hint>Zone ou étagère de stockage</mat-hint>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
            <mat-hint>Informations supplémentaires</mat-hint>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="primary" type="submit" [disabled]="stockForm.invalid || isSubmitting">
          <mat-icon>save</mat-icon>
          {{ data.isEdit ? 'Modifier' : 'Ajouter' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      flex: 1;
    }

    mat-dialog-content {
      min-width: 500px;
    }

    mat-dialog-actions {
      padding: 16px 0;
    }
  `]
})
export class StockFormDialogComponent implements OnInit {
  stockForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StockFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StockFormData
  ) {
    this.stockForm = this.fb.group({
      articleId: ['', Validators.required],
      quantite: [0, [Validators.required, Validators.min(0)]],
      quantiteReservee: [0, [Validators.min(0)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      typeStock: ['MatierePremiere', Validators.required],
      localisation: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.stock) {
      this.stockForm.patchValue({
        articleId: this.data.stock.article?.id,
        quantite: this.data.stock.quantite,
        quantiteReservee: this.data.stock.quantiteReservee,
        prixUnitaire: this.data.stock.prixUnitaire,
        typeStock: this.data.stock.typeStock,
        emplacementPhysique: this.data.stock.emplacementPhysique
      });
    }
  }

  onSubmit(): void {
    if (this.stockForm.valid) {
      this.isSubmitting = true;
      const formValue = this.stockForm.value;

      const stockData: Partial<Stock> = {
        articleId: formValue.articleId,
        quantite: formValue.quantite,
        quantiteReservee: formValue.quantiteReservee,
        prixUnitaire: formValue.prixUnitaire,
        typeStock: formValue.typeStock,
        emplacementPhysique: formValue.emplacementPhysique
      };

      this.dialogRef.close(stockData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}



// Auto-generated aliases for backward compatibility
export type StockFormData = IStockFormData;
