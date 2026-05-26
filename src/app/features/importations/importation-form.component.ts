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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ImportationService } from './importation.service';
import { FournisseurService } from '../../core/services/fournisseur.service';
import { ArticleService } from '../../core/services/article.service';
import { CommandeService } from '../commandes/commande.service';

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
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="importation-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>flight_land</mat-icon>
            {{ isEditMode ? 'Modifier' : 'Nouvelle' }} Importation
          </mat-card-title>
          <mat-card-subtitle>Gestion des importations de marchandises</mat-card-subtitle>
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
                    <mat-option *ngFor="let f of fournisseurs" [value]="f.id">{{ f.nomEntreprise }}</mat-option>
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
                  <mat-icon>add</mat-icon> Ajouter Article
                </button>
              </div>

              <div formArrayName="lignesImportation">
                <div *ngFor="let ligne of lignesImportationArray.controls; let i = index"
                     [formGroupName]="i" class="ligne-item">
                  <div class="ligne-header">
                    <h4>Article {{ i + 1 }}</h4>
                    <button mat-icon-button color="warn" type="button" (click)="removeLigne(i)"
                            [disabled]="lignesImportationArray.length === 1">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>

                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Article</mat-label>
                      <mat-select formControlName="articleId">
                        <mat-option *ngFor="let article of articles" [value]="article.id">
                          {{ article.designation || article.nom }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Commande client liée</mat-label>
                      <mat-select formControlName="commandeClientId">
                        <mat-option [value]="null">-- Aucune --</mat-option>
                        <mat-option *ngFor="let c of commandeClients" [value]="c.id">
                          {{ c.numeroCommande }}{{ c.titreCommande ? ' — ' + c.titreCommande : '' }}
                        </mat-option>
                      </mat-select>
                      <mat-icon matSuffix>link</mat-icon>
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

            <mat-divider></mat-divider>

            <!-- Documents à joindre -->
            <div class="form-section">
              <h3><mat-icon>attach_file</mat-icon> Documents joints</h3>

              <div class="upload-zone" (click)="fileInput.click()">
                <mat-icon>cloud_upload</mat-icon>
                <span>Cliquez pour ajouter des fichiers (PDF, Excel, image)</span>
                <input #fileInput type="file" multiple accept=".pdf,.xls,.xlsx,.jpg,.jpeg,.png"
                       style="display:none" (change)="onFilesSelected($event)">
              </div>

              <div *ngIf="selectedFiles.length > 0" class="file-list">
                <div *ngFor="let f of selectedFiles; let i = index" class="file-item">
                  <mat-icon>insert_drive_file</mat-icon>
                  <span class="file-name">{{ f.name }}</span>
                  <span class="file-size">({{ (f.size / 1024) | number:'1.0-0' }} Ko)</span>
                  <button mat-icon-button color="warn" type="button" (click)="removeFile(i)"
                          matTooltip="Supprimer ce fichier">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              </div>
              <p *ngIf="selectedFiles.length === 0" class="upload-hint">
                Aucun fichier sélectionné. Les fichiers seront joints après création.
              </p>
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
                  <span class="label">Fichiers à joindre:</span>
                  <span class="value">{{ selectedFiles.length }}</span>
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
                <mat-icon>cancel</mat-icon> Annuler
              </button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="!importationForm.valid || isSubmitting">
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
    .importation-form-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .form-section { margin-bottom: 30px; }
    .form-section h3 { margin-bottom: 16px; color: #333; display: flex; align-items: center; gap: 8px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
    .ligne-item { border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #fafafa; }
    .ligne-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .ligne-header h4 { margin: 0; color: #1976d2; }

    /* Upload */
    .upload-zone { border: 2px dashed #90caf9; border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; color: #1976d2; display: flex; align-items: center; justify-content: center; gap: 12px; transition: background 0.2s; margin-bottom: 12px; }
    .upload-zone:hover { background: #e3f2fd; }
    .upload-zone mat-icon { font-size: 32px; height: 32px; width: 32px; }
    .file-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
    .file-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #f5f5f5; border-radius: 6px; }
    .file-name { flex: 1; font-size: 0.875rem; }
    .file-size { color: #999; font-size: 0.8rem; }
    .upload-hint { color: #999; font-size: 0.875rem; margin: 4px 0; }

    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .summary-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
    .summary-item .label { font-weight: 500; color: #666; }
    .summary-item .value { font-weight: 600; color: #1976d2; font-size: 1.1em; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    mat-divider { margin: 30px 0; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .form-actions { flex-direction: column; }
      .section-header { flex-direction: column; gap: 12px; align-items: stretch; }
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
  commandeClients: any[] = [];
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private importationService: ImportationService,
    private fournisseurService: FournisseurService,
    private articleService: ArticleService,
    private commandeService: CommandeService,
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
    this.loadCommandeClients();
    this.addLigne();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.importationId = +params['id'];
        this.loadImportation(this.importationId);
      }
    });

    this.lignesImportationArray.valueChanges.subscribe(() => this.calculateMontants());
  }

  private generateReferenceImportation(): void {
    const today = new Date();
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const d = today.getDate().toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.importationForm.patchValue({ referenceImportation: `IMP-${y}${m}${d}-${rand}` });
  }

  get lignesImportationArray(): FormArray {
    return this.importationForm.get('lignesImportation') as FormArray;
  }

  addLigne(): void {
    this.lignesImportationArray.push(this.fb.group({
      articleId: ['', Validators.required],
      commandeClientId: [null],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      montantLigne: [0, Validators.required]
    }));
  }

  removeLigne(index: number): void {
    if (this.lignesImportationArray.length > 1) this.lignesImportationArray.removeAt(index);
  }

  calculateMontants(): void {
    this.lignesImportationArray.controls.forEach(ctrl => {
      const montant = (ctrl.get('quantite')?.value || 0) * (ctrl.get('prixUnitaire')?.value || 0);
      ctrl.get('montantLigne')?.setValue(montant, { emitEvent: false });
    });
  }

  getMontantTotal(): number {
    return this.lignesImportationArray.controls.reduce((s, ctrl) => s + (ctrl.get('montantLigne')?.value || 0), 0);
  }

  // --- Fichiers ---
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach(f => this.selectedFiles.push(f));
    input.value = '';
  }

  removeFile(i: number): void {
    this.selectedFiles.splice(i, 1);
  }

  // --- Chargements ---
  loadFournisseurs(): void {
    this.fournisseurService.getAll().subscribe({ next: (data) => { if (data?.length) this.fournisseurs = data; }, error: () => {} });
  }

  loadArticles(): void {
    this.articleService.getAll().subscribe({ next: (data) => { if (data?.length) this.articles = data; }, error: () => {} });
  }

  loadCommandeClients(): void {
    this.commandeService.getAll().subscribe({
      next: (data) => this.commandeClients = data.filter(c =>
        c.statut !== 'Terminee' && c.statut !== 'Annulee'),
      error: () => {}
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
        this.lignesImportationArray.clear();
        (importation as any).lignesImportation?.forEach((ligne: any) => {
          this.lignesImportationArray.push(this.fb.group({
            articleId: [ligne.articleId, Validators.required],
            commandeClientId: [ligne.commandeClientId ?? null],
            quantite: [ligne.quantite, [Validators.required, Validators.min(1)]],
            prixUnitaire: [ligne.prixUnitaire, [Validators.required, Validators.min(0)]],
            montantLigne: [ligne.montantLigne, Validators.required]
          }));
        });
      },
      error: () => this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 })
    });
  }

  onSubmit(): void {
    if (!this.importationForm.valid) {
      this.markFormGroupTouched();
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const importationData = { ...this.importationForm.value, montantTotal: this.getMontantTotal() };

    const request = this.isEditMode && this.importationId
      ? this.importationService.update(this.importationId, importationData)
      : this.importationService.create(importationData);

    request.subscribe({
      next: (result: any) => {
        const id = result?.id ?? this.importationId;
        if (!this.isEditMode && id && this.selectedFiles.length > 0) {
          const uploads = this.selectedFiles.map(f => this.importationService.uploadDocument(id, f));
          forkJoin(uploads).subscribe({
            next: () => this.afterSuccess(),
            error: () => {
              this.snackBar.open('Importation créée mais erreur lors de l\'upload de certains fichiers', 'OK', { duration: 5000 });
              this.router.navigate(['/importations']);
              this.isSubmitting = false;
            }
          });
        } else {
          this.afterSuccess();
        }
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || err?.error?.title || 'Erreur serveur', 'Fermer', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }

  private afterSuccess(): void {
    this.snackBar.open(`Importation ${this.isEditMode ? 'modifiée' : 'créée'} avec succès!`, 'OK', { duration: 3000 });
    this.router.navigate(['/importations']);
    this.isSubmitting = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.importationForm.controls).forEach(key => this.importationForm.get(key)?.markAsTouched());
    this.lignesImportationArray.controls.forEach(group => {
      if (group instanceof FormGroup) Object.keys(group.controls).forEach(k => group.get(k)?.markAsTouched());
    });
  }

  onCancel(): void {
    this.router.navigate(['/importations']);
  }
}
