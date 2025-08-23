import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { StockService, Article } from '../../core/services/stock.service';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './article-form.component.html',
  styleUrls: ['./article-form.component.scss']
})
export class ArticleFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() article: Article | null = null;
  @Input() isEditMode = false;
  @Output() save = new EventEmitter<Article>();
  @Output() cancel = new EventEmitter<void>();

  articleForm!: FormGroup;
  loading = false;
  error: string | null = null;
  categories: string[] = [];
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    
    if (this.article && this.isEditMode) {
      this.populateForm(this.article);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.articleForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      reference: ['', [Validators.required]],
      codeBarres: [''],
      description: [''],
      categorie: ['', [Validators.required]],
      prix: [0, [Validators.required, Validators.min(0)]],
      unite: ['', [Validators.required]],
      quantite: [0, [Validators.min(0)]],
      seuilMinimum: [0, [Validators.required, Validators.min(0)]],
      seuilMaximum: [null, [Validators.min(0)]],
      emplacement: [''],
      actif: [true]
    });

    // Add custom validator for seuilMaximum
    this.articleForm.get('seuilMaximum')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(maxValue => {
        const minValue = this.articleForm.get('seuilMinimum')?.value;
        if (maxValue && minValue && maxValue <= minValue) {
          this.articleForm.get('seuilMaximum')?.setErrors({ 'invalidRange': true });
        }
      });
  }

  private populateForm(article: Article): void {
    this.articleForm.patchValue({
      nom: article.nom,
      reference: article.reference,
      codeBarres: article.codeBarres || '',
      description: article.description || '',
      categorie: article.categorie,
      prix: article.prix,
      unite: article.unite,
      quantite: article.quantite,
      seuilMinimum: article.seuilMinimum,
      seuilMaximum: article.seuilMaximum || null,
      emplacement: article.emplacement || '',
      actif: article.actif
    });

    if (article.imageUrl) {
      this.imagePreview = article.imageUrl;
    }
  }

  private async loadCategories(): Promise<void> {
    try {
      this.categories = await this.stockService.getCategories().toPromise() || [];
      
      // Add default categories if none exist
      if (this.categories.length === 0) {
        this.categories = [
          'Tissus',
          'Accessoires',
          'Fils',
          'Boutons',
          'Fermetures',
          'Outils',
          'Autres'
        ];
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      // Use default categories on error
      this.categories = [
        'Tissus',
        'Accessoires',
        'Fils',
        'Boutons',
        'Fermetures',
        'Outils',
        'Autres'
      ];
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('L\'image ne doit pas dépasser 5MB', 'Fermer', {
          duration: 3000
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Veuillez sélectionner une image valide', 'Fermer', {
          duration: 3000
        });
        return;
      }

      this.selectedImageFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedImageFile = null;
  }

  async onSubmit(): Promise<void> {
    if (this.articleForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    try {
      this.loading = true;
      this.error = null;

      const formValue = this.articleForm.value;
      
      // Prepare article data
      const articleData: Partial<Article> = {
        ...formValue,
        dateModification: new Date()
      };

      if (!this.isEditMode) {
        articleData.dateCreation = new Date();
      }

      // Handle image upload if needed
      if (this.selectedImageFile) {
        // TODO: Implement image upload to server
        // For now, we'll use the preview URL
        articleData.imageUrl = this.imagePreview || undefined;
      }

      let savedArticle: Article;
      
      if (this.isEditMode && this.article) {
        savedArticle = await this.stockService.updateArticle(this.article.id, articleData).toPromise() as Article;
        this.snackBar.open('Article modifié avec succès', 'Fermer', {
          duration: 3000
        });
      } else {
        savedArticle = await this.stockService.createArticle(articleData).toPromise() as Article;
        this.snackBar.open('Article créé avec succès', 'Fermer', {
          duration: 3000
        });
      }

      this.save.emit(savedArticle);
      
    } catch (error: any) {
      this.handleError('Erreur lors de la sauvegarde', error);
    } finally {
      this.loading = false;
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.articleForm.controls).forEach(key => {
      const control = this.articleForm.get(key);
      control?.markAsTouched();
    });
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    
    let errorMessage = message;
    if (error?.error?.message) {
      errorMessage += ': ' + error.error.message;
    } else if (error?.message) {
      errorMessage += ': ' + error.message;
    }
    
    this.error = errorMessage;
    this.snackBar.open(errorMessage, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Getters for template
  get isFormValid(): boolean {
    return this.articleForm.valid;
  }

  get formErrors(): string[] {
    const errors: string[] = [];
    
    Object.keys(this.articleForm.controls).forEach(key => {
      const control = this.articleForm.get(key);
      if (control?.errors && control.touched) {
        if (control.errors['required']) {
          errors.push(`${this.getFieldLabel(key)} est obligatoire`);
        }
        if (control.errors['minlength']) {
          errors.push(`${this.getFieldLabel(key)} est trop court`);
        }
        if (control.errors['min']) {
          errors.push(`${this.getFieldLabel(key)} doit être positif`);
        }
        if (control.errors['invalidRange']) {
          errors.push('Le seuil maximum doit être supérieur au seuil minimum');
        }
      }
    });
    
    return errors;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nom: 'Le nom',
      reference: 'La référence',
      categorie: 'La catégorie',
      prix: 'Le prix',
      unite: 'L\'unité',
      seuilMinimum: 'Le seuil minimum',
      seuilMaximum: 'Le seuil maximum',
      quantite: 'La quantité'
    };
    
    return labels[fieldName] || fieldName;
  }
}
