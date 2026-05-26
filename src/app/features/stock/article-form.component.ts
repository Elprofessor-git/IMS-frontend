import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../shared/models/stock.model';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>{{ isEdit ? 'edit' : 'add_box' }}</mat-icon>
            {{ isEdit ? 'Modifier' : 'Nouvel' }} Article
          </mat-card-title>
          <mat-card-subtitle>{{ isEdit ? 'Modifier un article existant' : 'Ajouter un nouvel article au stock' }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="articleForm" (ngSubmit)="onSubmit()">
            <!-- Désignation de l'article -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Désignation de l'article</mat-label>
              <input matInput formControlName="designation" placeholder="Ex: T-shirt coton">
              <mat-icon matSuffix>label</mat-icon>
              <mat-error *ngIf="articleForm.get('designation')?.hasError('required')">
                La désignation est requise
              </mat-error>
            </mat-form-field>

            <!-- Description -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" 
                        placeholder="Description détaillée de l'article"></textarea>
              <mat-icon matSuffix>description</mat-icon>
            </mat-form-field>

            <!-- Référence -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Référence</mat-label>
              <input matInput formControlName="reference" placeholder="REF-001">
              <mat-icon matSuffix>qr_code</mat-icon>
              <mat-error *ngIf="articleForm.get('reference')?.hasError('required')">
                La référence est requise
              </mat-error>
            </mat-form-field>

            <!-- Prix unitaire moyen -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Prix unitaire moyen</mat-label>
              <input matInput type="number" formControlName="prixUnitaireMoyen" 
                     placeholder="0.00" step="0.01" min="0">
              <span matPrefix>€&nbsp;</span>
              <mat-error *ngIf="articleForm.get('prixUnitaireMoyen')?.hasError('required')">
                Le prix est requis
              </mat-error>
              <mat-error *ngIf="articleForm.get('prixUnitaireMoyen')?.hasError('min')">
                Le prix doit être positif
              </mat-error>
            </mat-form-field>

            <!-- Seuil d'alerte -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Seuil d'alerte</mat-label>
              <input matInput type="number" formControlName="seuilAlerte" 
                     placeholder="10" min="0">
              <mat-icon matSuffix>warning</mat-icon>
              <mat-error *ngIf="articleForm.get('seuilAlerte')?.hasError('min')">
                Le seuil doit être positif
              </mat-error>
            </mat-form-field>

            <!-- Seuil critique -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Seuil critique</mat-label>
              <input matInput type="number" formControlName="seuilCritique" 
                     placeholder="5" min="0">
              <mat-icon matSuffix>error</mat-icon>
              <mat-error *ngIf="articleForm.get('seuilCritique')?.hasError('min')">
                Le seuil critique doit être positif
              </mat-error>
            </mat-form-field>

            <!-- Catégorie -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Catégorie</mat-label>
              <mat-select formControlName="categorie">
                <mat-option value="textile">Textile</mat-option>
                <mat-option value="accessoire">Accessoire</mat-option>
                <mat-option value="fourniture">Fourniture</mat-option>
                <mat-option value="autre">Autre</mat-option>
              </mat-select>
              <mat-icon matSuffix>category</mat-icon>
            </mat-form-field>

            <!-- Unité -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Unité de mesure</mat-label>
              <mat-select formControlName="unite">
                <mat-option value="Pièce">Pièce</mat-option>
                <mat-option value="Mètre">Mètre</mat-option>
                <mat-option value="Kilogramme">Kilogramme</mat-option>
                <mat-option value="Litre">Litre</mat-option>
              </mat-select>
              <mat-icon matSuffix>straighten</mat-icon>
            </mat-form-field>
            <!-- Zone upload image -->
            <div class="image-upload-section">
              <div class="image-preview" *ngIf="imagePreview">
                <img [src]="imagePreview" alt="Aperçu">
                <button mat-icon-button type="button" class="remove-btn" (click)="removeImage()" matTooltip="Supprimer l'image">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <div class="image-placeholder" *ngIf="!imagePreview">
                <mat-icon>image</mat-icon>
                <span>Aucune image sélectionnée</span>
              </div>
              <button mat-stroked-button type="button" (click)="fileInput.click()">
                <mat-icon>upload</mat-icon>
                Choisir une image
              </button>
              <input #fileInput type="file" accept="image/*" hidden (change)="onImageSelected($event)">
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="onCancel()">
            <mat-icon>cancel</mat-icon>
            Annuler
          </button>
          <button mat-raised-button color="primary"
                  [disabled]="articleForm.invalid || isSubmitting"
                  (click)="onSubmit()">
            <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
            <mat-icon *ngIf="!isSubmitting">save</mat-icon>
            <span *ngIf="!isSubmitting">{{ isEdit ? 'Modifier' : 'Créer' }} l'article</span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-card {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      color: #1976d2;
    }

    mat-card-actions {
      padding: 16px 24px;
      gap: 12px;
    }

    .mat-mdc-raised-button {
      min-width: 140px;
    }

    .mat-spinner {
      margin-right: 8px;
    }

    .image-upload-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
      padding: 16px;
      border: 1px dashed #ccc;
      border-radius: 8px;
    }

    .image-preview {
      position: relative;
      display: inline-block;
    }

    .image-preview img {
      max-width: 200px;
      max-height: 200px;
      border-radius: 4px;
      object-fit: cover;
      border: 1px solid #ddd;
    }

    .remove-btn {
      position: absolute;
      top: -12px;
      right: -12px;
      background: white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }

    .image-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: #999;
      padding: 12px;
    }

    .image-placeholder mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
    }

    @media (max-width: 768px) {
      .form-container {
        margin: 10px;
        padding: 10px;
      }
      
      mat-card {
        margin: 0;
      }
    }
  `]
})
export class ArticleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private articleService = inject(ArticleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  articleForm: FormGroup;
  isSubmitting = false;
  isEdit = false;
  private articleId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor() {
    this.articleForm = this.fb.group({
      designation: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      reference: ['', [Validators.required]],
      prixUnitaireMoyen: [0, [Validators.required, Validators.min(0)]],
      seuilAlerte: [10, [Validators.min(0)]],
      seuilCritique: [5, [Validators.min(0)]],
      categorie: ['textile'],
      unite: ['Pièce'],
      estActif: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.articleId = +id;
      this.articleService.getById(this.articleId).subscribe({
        next: (article) => {
          this.articleForm.patchValue({
            designation: article.designation,
            description: article.description,
            reference: article.reference,
            prixUnitaireMoyen: article.prixUnitaireMoyen,
            seuilAlerte: article.seuilAlerte,
            seuilCritique: article.seuilCritique,
            categorie: article.categorie,
            unite: article.unite,
            estActif: article.estActif
          });
        },
        error: () => {
          this.snackBar.open('Erreur lors du chargement de l\'article', 'Fermer', { duration: 3000 });
          this.router.navigate(['/stock/articles']);
        }
      });
    } else {
      this.generateReference();
    }
  }

  private generateReference(): void {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    this.articleForm.patchValue({
      reference: `ART-${timestamp}-${randomNum}`
    });
  }

  onSubmit(): void {
    if (this.articleForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const articleData = this.articleForm.value;

    const request = this.isEdit && this.articleId
      ? this.articleService.update(this.articleId, articleData)
      : this.articleService.create(articleData);

    request.subscribe({
      next: (response: any) => {
        if (!this.isEdit && this.selectedFile && response?.id) {
          this.uploadImage(response.id, () => this.router.navigate(['/stock/articles']));
        } else {
          this.isSubmitting = false;
          this.snackBar.open(`Article ${this.isEdit ? 'modifié' : 'créé'} avec succès!`, 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/stock/articles']);
        }
      },
      error: (error: any) => {
        this.isSubmitting = false;
        let errorMessage = `Erreur lors de ${this.isEdit ? 'la modification' : 'la création'} de l'article`;
        if (error.status === 400) {
          errorMessage = 'Données invalides. Vérifiez les champs.';
        } else if (error.status === 409) {
          errorMessage = 'Un article avec cette référence existe déjà.';
        }
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result as string; };
    reader.readAsDataURL(this.selectedFile);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  private uploadImage(articleId: number, onDone: () => void): void {
    this.articleService.uploadImage(articleId, this.selectedFile!).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Article créé avec succès!', 'Fermer', { duration: 3000 });
        onDone();
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('Article créé mais erreur lors de l\'upload image', 'Fermer', { duration: 4000 });
        onDone();
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/stock/articles']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.articleForm.controls).forEach(key => {
      const control = this.articleForm.get(key);
      control?.markAsTouched();
    });
  }
}


