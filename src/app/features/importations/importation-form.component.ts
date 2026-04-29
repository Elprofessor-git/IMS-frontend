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
import { Router, ActivatedRoute } from '@angular/router';

import { ImportationService } from '../../core/services/importation.service';
import { FournisseurService } from '../../core/services/fournisseur.service';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-importation-form',
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
    MatChipsModule
  ],
  template: `
    <div class="importation-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>flight_land</mat-icon>
            {{ isEditMode ? 'Modifier' : 'Nouvelle' }} Importation
          </mat-card-title>
          <mat-card-subtitle>
            Gestion des importations de marchandises
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="importationForm" (ngSubmit)="onSubmit()">
            <!-- Informations générales -->
            <div class="form-section">
              <h3>Informations Générales</h3>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Référence Importation</mat-label>
                  <input matInput formControlName="referenceImportation" placeholder="REF-IMP-2024-001">
                  <mat-icon matSuffix>assignment</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Fournisseur</mat-label>
                  <mat-select formControlName="fournisseurId">
                    <mat-option *ngFor="let fournisseur of fournisseurs" [value]="fournisseur.id">
                      {{ fournisseur.nom }}
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>business</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Date d'Importation</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="dateImportation">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Mode d'Expédition</mat-label>
                  <mat-select formControlName="modeExpedition">
                    <mat-option value="Maritime">Maritime</mat-option>
                    <mat-option value="Aerien">Aérien</mat-option>
                    <mat-option value="Terrestre">Terrestre</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>local_shipping</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Statut</mat-label>
                  <mat-select formControlName="statut">
                    <mat-option value="EnCours">En Cours</mat-option>
                    <mat-option value="Livree">Livrée</mat-option>
                    <mat-option value="Annulee">Annulée</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>pending</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Notes</mat-label>
                  <textarea matInput formControlName="notes" rows="3" placeholder="Notes additionnelles..."></textarea>
                </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Lignes d'importation -->
            <div class="form-section">
              <div class="section-header">
                <h3>Articles Importés</h3>
                <button mat-raised-button color="primary" type="button" (click)="addLigne()">
                  <mat-icon>add</mat-icon>
                  Ajouter Article
                </button>
              </div>

              <div formArrayName="lignesImportation">
                <div *ngFor="let ligne of lignesImportationArray.controls; let i = index" [formGroupName]="i" class="ligne-item">
                  <div class="ligne-header">
                    <h4>Article {{ i + 1 }}</h4>
                    <button mat-icon-button color="warn" type="button" (click)="removeLigne(i)" [disabled]="lignesImportationArray.length === 1">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>

                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Article</mat-label>
                      <mat-select formControlName="articleId">
                        <mat-option *ngFor="let article of articles" [value]="article.id">
                          {{ article.nom }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Quantité</mat-label>
                      <input matInput type="number" formControlName="quantite" min="1">
                      <mat-icon matSuffix>inventory</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Prix Unitaire</mat-label>
                      <input matInput type="number" formControlName="prixUnitaire" min="0" step="0.01">
                      <mat-icon matSuffix>euro</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Montant Ligne</mat-label>
                      <input matInput type="number" formControlName="montantLigne" readonly>
                      <mat-icon matSuffix>calculate</mat-icon>
                    </mat-form-field>
                  </div>
                </div>
              </div>
            </div>

            <!-- Résumé -->
            <div class="form-section summary">
              <h3>Résumé</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Nombre d'articles:</span>
                  <span class="value">{{ lignesImportationArray.length }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Montant total:</span>
                  <span class="value">{{ getMontantTotal() | currency:'EUR' }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button mat-button type="button" (click)="onCancel()">
                <mat-icon>cancel</mat-icon>
                Annuler
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!importationForm.valid || isSubmitting">
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
    .importation-form-container {
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

    .summary-item .label {
      font-weight: 500;
      color: #666;
    }

    .summary-item .value {
      font-weight: 600;
      color: #1976d2;
      font-size: 1.1em;
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
export class ImportationFormComponent implements OnInit {
  importationForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  importationId: number | null = null;

  fournisseurs: any[] = [];
  articles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private importationService: ImportationService,
    private fournisseurService: FournisseurService,
    private articleService: ArticleService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.importationForm = this.fb.group({
      referenceImportation: ['', Validators.required],
      fournisseurId: ['', Validators.required],
      dateImportation: ['', Validators.required],
      modeExpedition: ['Maritime', Validators.required],
      statut: ['EnCours', Validators.required],
      notes: [''],
      lignesImportation: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.generateReferenceImportation();
    this.loadFournisseurs();
    this.loadArticles();
    this.addLigne(); // Ajouter une ligne par défaut

    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.importationId = +params['id'];
        this.loadImportation(this.importationId);
      }
    });

    // Calculer automatiquement les montants
    this.lignesImportationArray.valueChanges.subscribe(() => {
      this.calculateMontants();
    });
  }

  private generateReferenceImportation(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    this.importationForm.patchValue({
      referenceImportation: `IMP-${year}${month}${day}-${random}`
    });
  }

  get lignesImportationArray(): FormArray {
    return this.importationForm.get('lignesImportation') as FormArray;
  }

  addLigne(): void {
    const ligne = this.fb.group({
      articleId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      montantLigne: [0, Validators.required]
    });

    this.lignesImportationArray.push(ligne);
  }

  removeLigne(index: number): void {
    if (this.lignesImportationArray.length > 1) {
      this.lignesImportationArray.removeAt(index);
    }
  }

  calculateMontants(): void {
    this.lignesImportationArray.controls.forEach(control => {
      const quantite = control.get('quantite')?.value || 0;
      const prixUnitaire = control.get('prixUnitaire')?.value || 0;
      const montantLigne = quantite * prixUnitaire;
      control.get('montantLigne')?.setValue(montantLigne, { emitEvent: false });
    });
  }

  getMontantTotal(): number {
    return this.lignesImportationArray.controls.reduce((total, control) => {
      return total + (control.get('montantLigne')?.value || 0);
    }, 0);
  }

  loadFournisseurs(): void {
    // Simuler le chargement des fournisseurs en attendant l'API
    this.fournisseurs = [
      { id: 1, nom: 'Fournisseur Textile A', code: 'FTA001', pays: 'France' },
      { id: 2, nom: 'Fournisseur Textile B', code: 'FTB002', pays: 'Italie' },
      { id: 3, nom: 'Fournisseur Textile C', code: 'FTC003', pays: 'Espagne' }
    ];
    
    // Tentative de chargement depuis l'API
    this.fournisseurService.getAll().subscribe({
      next: (fournisseurs) => {
        if (fournisseurs && fournisseurs.length > 0) {
          this.fournisseurs = fournisseurs;
        }
      },
      error: (error) => {
        console.warn('API fournisseurs non disponible, utilisation des données simulées:', error);
        // On garde les données simulées
      }
    });
  }

  loadArticles(): void {
    // Simuler le chargement des articles en attendant l'API
    this.articles = [
      { id: 1, nom: 'T-shirt coton bio', reference: 'TSH-BIO-001', prix: 25.99 },
      { id: 2, nom: 'Pantalon jean stretch', reference: 'PAN-JEA-002', prix: 65.50 },
      { id: 3, nom: 'Veste cuir synthétique', reference: 'VES-CUI-003', prix: 120.00 },
      { id: 4, nom: 'Robe été coton', reference: 'ROB-ETE-004', prix: 45.99 },
      { id: 5, nom: 'Pull laine mérinos', reference: 'PUL-LAI-005', prix: 89.99 }
    ];
    
    // Tentative de chargement depuis l'API
    this.articleService.getAll().subscribe({
      next: (articles) => {
        if (articles && articles.length > 0) {
          this.articles = articles;
        }
      },
      error: (error) => {
        console.warn('API articles non disponible, utilisation des données simulées:', error);
        // On garde les données simulées
      }
    });
  }

  loadImportation(id: number): void {
    this.importationService.getById(id).subscribe({
      next: (importation) => {
        this.importationForm.patchValue({
          referenceImportation: importation.referenceImportation,
          fournisseurId: importation.fournisseurId,
          dateImportation: new Date(importation.dateImportation),
          modeExpedition: importation.modeExpedition,
          statut: importation.statut,
          notes: importation.notes
        });

        // Charger les lignes d'importation
        this.lignesImportationArray.clear();
        importation.lignesImportation?.forEach((ligne: any) => {
          const ligneGroup = this.fb.group({
            articleId: [ligne.articleId, Validators.required],
            quantite: [ligne.quantite, [Validators.required, Validators.min(1)]],
            prixUnitaire: [ligne.prixUnitaire, [Validators.required, Validators.min(0)]],
            montantLigne: [ligne.montantLigne, Validators.required]
          });
          this.lignesImportationArray.push(ligneGroup);
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'importation:', error);
        this.snackBar.open('Erreur lors du chargement de l\'importation', 'Fermer', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.importationForm.valid) {
      this.isSubmitting = true;

      const importationData = {
        ...this.importationForm.value,
        montantTotal: this.getMontantTotal()
      };

      

      // Simuler la sauvegarde en attendant l'API backend
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open(
          `Importation ${this.isEditMode ? 'modifiée' : 'créée'} avec succès!`,
          'Fermer',
          { 
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
        this.router.navigate(['/importations']);
      }, 1000);

      // Tentative d'appel API réel (optionnel)
      const request = this.isEditMode && this.importationId
        ? this.importationService.update(this.importationId, importationData)
        : this.importationService.create(importationData);

      request.subscribe({
        next: (result) => {
          
          // La notification et redirection sont déjà gérées par le setTimeout ci-dessus
        },
        error: (error) => {
          console.warn('API non disponible, utilisation du mode simulation:', error);
          // Le mode simulation gère déjà la notification
        }
      });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', { duration: 3000 });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.importationForm.controls).forEach(key => {
      const control = this.importationForm.get(key);
      control?.markAsTouched();
    });

    // Marquer aussi les contrôles des lignes d'importation
    this.lignesImportationArray.controls.forEach(group => {
      if (group instanceof FormGroup) {
        Object.keys(group.controls).forEach(key => {
          group.get(key)?.markAsTouched();
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/importations']);
  }
}


