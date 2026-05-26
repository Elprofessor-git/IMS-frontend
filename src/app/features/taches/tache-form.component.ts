import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TacheService } from './tache.service';

@Component({
  selector: 'app-tache-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>{{ isEdit ? 'edit' : 'add_task' }}</mat-icon>
            {{ isEdit ? 'Modifier' : 'Nouvelle' }} Tâche
          </mat-card-title>
          <mat-card-subtitle>{{ isEdit ? 'Modifier une tâche existante' : 'Créer une nouvelle tâche de production' }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="tacheForm" (ngSubmit)="onSubmit()">
            <!-- Nom de la tâche -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom de la tâche</mat-label>
              <input matInput formControlName="titre" placeholder="Ex: Production Lot A">
              <mat-icon matSuffix>task</mat-icon>
              <mat-error *ngIf="tacheForm.get('titre')?.hasError('required')">
                Le nom est requis
              </mat-error>
            </mat-form-field>

            <!-- Description -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" 
                        placeholder="Description détaillée de la tâche"></textarea>
              <mat-icon matSuffix>description</mat-icon>
            </mat-form-field>

            <!-- Priorité -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Priorité</mat-label>
              <mat-select formControlName="priorite">
                <mat-option value="Basse">Basse</mat-option>
                <mat-option value="Normale">Normale</mat-option>
                <mat-option value="Haute">Haute</mat-option>
                <mat-option value="Critique">Critique</mat-option>
              </mat-select>
              <mat-icon matSuffix>priority_high</mat-icon>
            </mat-form-field>

            <!-- Statut -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Statut</mat-label>
              <mat-select formControlName="statut">
                <mat-option value="NonCommence">Non commencée</mat-option>
                <mat-option value="EnCours">En cours</mat-option>
                <mat-option value="Bloque">Bloquée</mat-option>
                <mat-option value="Termine">Terminée</mat-option>
                <mat-option value="Annule">Annulée</mat-option>
              </mat-select>
              <mat-icon matSuffix>flag</mat-icon>
            </mat-form-field>

            <!-- Date de fin prévue -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date de fin prévue</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dateFinPrevue">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="tacheForm.get('dateFinPrevue')?.hasError('required')">
                La date de fin est requise
              </mat-error>
            </mat-form-field>

            <!-- Assigné à -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Assigné à</mat-label>
              <input matInput formControlName="responsableAssigne" placeholder="Nom du responsable">
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>

            <!-- Progression -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Progression (%)</mat-label>
              <input matInput type="number" formControlName="pourcentageAvancement"
                     min="0" max="100" placeholder="0">
              <span matSuffix>%</span>
              <mat-error *ngIf="tacheForm.get('pourcentageAvancement')?.hasError('min')">
                La progression doit être >= 0
              </mat-error>
              <mat-error *ngIf="tacheForm.get('pourcentageAvancement')?.hasError('max')">
                La progression doit être <= 100
              </mat-error>
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="onCancel()">
            <mat-icon>cancel</mat-icon>
            Annuler
          </button>
          <button mat-raised-button color="primary"
                  [disabled]="tacheForm.invalid || isSubmitting"
                  (click)="onSubmit()">
            <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
            <mat-icon *ngIf="!isSubmitting">save</mat-icon>
            <span *ngIf="!isSubmitting">{{ isEdit ? 'Modifier' : 'Créer' }} la tâche</span>
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
export class TacheFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private tacheService = inject(TacheService);

  tacheForm: FormGroup;
  isSubmitting = false;
  isEdit = false;
  private tacheId: number | null = null;

  constructor() {
    this.tacheForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priorite: ['Normale', [Validators.required]],
      statut: ['NonCommence', [Validators.required]],
      dateFinPrevue: ['', [Validators.required]],
      responsableAssigne: [''],
      pourcentageAvancement: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.tacheId = +id;
      this.tacheService.getById(this.tacheId).subscribe({
        next: (tache) => {
          this.tacheForm.patchValue({
            titre: tache.titre,
            description: tache.description,
            priorite: tache.priorite,
            statut: tache.statut,
            dateFinPrevue: tache.dateFinPrevue ? new Date(tache.dateFinPrevue) : null,
            responsableAssigne: tache.assigneA ?? '',
            pourcentageAvancement: tache.pourcentageAvancement
          });
        },
        error: () => {
          this.snackBar.open('Erreur lors du chargement de la tâche', 'Fermer', { duration: 3000 });
          this.router.navigate(['/taches']);
        }
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.tacheForm.patchValue({ dateFinPrevue: tomorrow });
    }
  }

  onSubmit(): void {
    if (this.tacheForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const tacheData = this.tacheForm.value;

    const request = this.isEdit && this.tacheId
      ? this.tacheService.update(this.tacheId, tacheData)
      : this.tacheService.creerTache(tacheData);

    request.subscribe({
      next: () => {
        this.snackBar.open(`Tâche ${this.isEdit ? 'modifiée' : 'créée'} avec succès!`, 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/taches']);
        this.isSubmitting = false;
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.title || 'Erreur serveur';
        this.snackBar.open(msg, 'Fermer', { duration: 5000, panelClass: ['error-snackbar'] });
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/taches']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.tacheForm.controls).forEach(key => {
      this.tacheForm.get(key)?.markAsTouched();
    });
  }
}


