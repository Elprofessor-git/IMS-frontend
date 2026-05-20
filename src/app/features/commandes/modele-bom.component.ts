import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ModeleBomService, ModeleBom } from './modele-bom.service';

@Component({
  selector: 'app-modele-bom',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="bom-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>account_tree</mat-icon>
            Nomenclatures (BOM)
          </mat-card-title>
          <mat-card-subtitle>Définissez les fournitures nécessaires par modèle</mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="toggleCreation()">
            <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
            {{ showForm ? 'Annuler' : 'Nouveau modèle' }}
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Formulaire création -->
      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editId ? 'Modifier le modèle' : 'Nouveau modèle BOM' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="bomForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom du modèle</mat-label>
              <input matInput formControlName="nom" placeholder="Ex: T-shirt col rond">
              <mat-error *ngIf="bomForm.get('nom')?.hasError('required')">Nom requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <input matInput formControlName="description">
            </mat-form-field>

            <div class="fournitures-header">
              <h4>Fournitures</h4>
              <button mat-icon-button type="button" color="primary" (click)="ajouterFourniture()" matTooltip="Ajouter une fourniture">
                <mat-icon>add_circle</mat-icon>
              </button>
            </div>

            <div formArrayName="fournitures">
              <div *ngFor="let f of getFournitures().controls; let i = index" [formGroupName]="i" class="fourniture-row">
                <mat-form-field appearance="outline" class="field-article">
                  <mat-label>Désignation</mat-label>
                  <input matInput formControlName="designation" placeholder="Ex: Tissu coton">
                </mat-form-field>
                <mat-form-field appearance="outline" class="field-id">
                  <mat-label>ID Article</mat-label>
                  <input matInput type="number" formControlName="articleId">
                </mat-form-field>
                <mat-form-field appearance="outline" class="field-qte">
                  <mat-label>Qté/pièce</mat-label>
                  <input matInput type="number" formControlName="qteParPiece" step="0.01" min="0">
                </mat-form-field>
                <mat-form-field appearance="outline" class="field-unite">
                  <mat-label>Unité</mat-label>
                  <input matInput formControlName="unite" placeholder="m, kg, pcs">
                </mat-form-field>
                <button mat-icon-button type="button" color="warn" (click)="supprimerFourniture(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-button (click)="toggleCreation()">Annuler</button>
          <button mat-raised-button color="primary" [disabled]="bomForm.invalid || isSaving" (click)="sauvegarder()">
            <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
            <span *ngIf="!isSaving">Sauvegarder</span>
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Liste des modèles -->
      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <mat-accordion *ngIf="!loading">
        <mat-expansion-panel *ngFor="let bom of modeles" class="bom-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="panel-icon">account_tree</mat-icon>
              {{ bom.nom }}
            </mat-panel-title>
            <mat-panel-description>
              {{ bom.fournitures.length }} fourniture(s)
            </mat-panel-description>
          </mat-expansion-panel-header>

          <p *ngIf="bom.description" class="bom-desc">{{ bom.description }}</p>

          <table mat-table [dataSource]="bom.fournitures || []" class="fournitures-table">
            <ng-container matColumnDef="designation">
              <th mat-header-cell *matHeaderCellDef>Désignation</th>
              <td mat-cell *matCellDef="let f">{{ f.designation }}</td>
            </ng-container>
            <ng-container matColumnDef="articleId">
              <th mat-header-cell *matHeaderCellDef>ID Article</th>
              <td mat-cell *matCellDef="let f">{{ f.articleId }}</td>
            </ng-container>
            <ng-container matColumnDef="qteParPiece">
              <th mat-header-cell *matHeaderCellDef>Qté / pièce</th>
              <td mat-cell *matCellDef="let f">{{ f.qteParPiece }}</td>
            </ng-container>
            <ng-container matColumnDef="unite">
              <th mat-header-cell *matHeaderCellDef>Unité</th>
              <td mat-cell *matCellDef="let f">{{ f.unite }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="colsFournitures"></tr>
            <tr mat-row *matRowDef="let row; columns: colsFournitures;"></tr>
          </table>

          <mat-divider></mat-divider>
          <div class="panel-actions">
            <button mat-button color="primary" (click)="editer(bom)">
              <mat-icon>edit</mat-icon> Modifier
            </button>
            <button mat-button color="warn" (click)="supprimer(bom.id)">
              <mat-icon>delete</mat-icon> Supprimer
            </button>
          </div>
        </mat-expansion-panel>

        <div *ngIf="modeles.length === 0" class="empty-state">
          <mat-icon>account_tree</mat-icon>
          <p>Aucun modèle BOM défini. Créez le premier !</p>
        </div>
      </mat-accordion>
    </div>
  `,
  styles: [`
    .bom-container { max-width: 900px; margin: 20px auto; padding: 0 16px; display: flex; flex-direction: column; gap: 16px; }
    .header-card mat-card-title { display: flex; align-items: center; gap: 8px; color: #1976d2; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .fournitures-header { display: flex; align-items: center; gap: 8px; margin: 16px 0 8px; }
    .fournitures-header h4 { margin: 0; flex: 1; color: #333; }
    .fourniture-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
    .field-article { flex: 2; min-width: 160px; }
    .field-id, .field-qte { flex: 1; min-width: 90px; }
    .field-unite { flex: 1; min-width: 80px; }
    .fournitures-table { width: 100%; margin: 12px 0; }
    .bom-panel { margin-bottom: 8px; }
    .panel-icon { margin-right: 8px; color: #1976d2; }
    .panel-actions { display: flex; gap: 8px; padding: 8px 0; }
    .bom-desc { color: #666; font-style: italic; margin: 8px 0; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 40px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; }
  `]
})
export class ModeleBomComponent implements OnInit {
  modeles: ModeleBom[] = [];
  loading = false;
  isSaving = false;
  showForm = false;
  editId: number | null = null;
  colsFournitures = ['designation', 'articleId', 'qteParPiece', 'unite'];

  bomForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private bomService: ModeleBomService,
    private snackBar: MatSnackBar
  ) {
    this.bomForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      fournitures: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.chargerModeles();
  }

  getFournitures(): FormArray {
    return this.bomForm.get('fournitures') as FormArray;
  }

  ajouterFourniture(): void {
    this.getFournitures().push(this.fb.group({
      articleId: [null, Validators.required],
      designation: ['', Validators.required],
      qteParPiece: [1, [Validators.required, Validators.min(0.001)]],
      unite: ['pcs', Validators.required]
    }));
  }

  supprimerFourniture(i: number): void {
    this.getFournitures().removeAt(i);
  }

  toggleCreation(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editId = null;
      this.bomForm.reset({ nom: '', description: '' });
      this.getFournitures().clear();
    }
  }

  editer(bom: ModeleBom): void {
    this.editId = bom.id;
    this.showForm = true;
    this.getFournitures().clear();
    this.bomForm.patchValue({ nom: bom.nom, description: bom.description || '' });
    (bom.fournitures || []).forEach(f => {
      this.getFournitures().push(this.fb.group({
        articleId: [f.articleId, Validators.required],
        designation: [f.designation, Validators.required],
        qteParPiece: [f.qteParPiece, [Validators.required, Validators.min(0.001)]],
        unite: [f.unite, Validators.required]
      }));
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  chargerModeles(): void {
    this.loading = true;
    this.bomService.getAll().subscribe({
      next: (data) => { this.modeles = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  sauvegarder(): void {
    if (this.bomForm.invalid) return;
    this.isSaving = true;
    const payload = this.bomForm.value;
    const req$ = this.editId
      ? this.bomService.update(this.editId, payload)
      : this.bomService.create(payload);

    req$.subscribe({
      next: () => {
        this.snackBar.open(this.editId ? 'Modèle modifié' : 'Modèle créé', 'OK', { duration: 3000 });
        this.isSaving = false;
        this.toggleCreation();
        this.chargerModeles();
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erreur', 'Fermer', { duration: 5000 });
        this.isSaving = false;
      }
    });
  }

  supprimer(id: number): void {
    if (!confirm('Supprimer ce modèle BOM ?')) return;
    this.bomService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Modèle supprimé', 'OK', { duration: 3000 });
        this.chargerModeles();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Erreur', 'Fermer', { duration: 5000 })
    });
  }
}
