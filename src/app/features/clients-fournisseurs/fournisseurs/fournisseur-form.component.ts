import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { FournisseurService } from '../../../core/services/fournisseur.service';

@Component({
  selector: 'app-fournisseur-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card class="form-card">
      <mat-card-header>
        <mat-card-title>{{ isEdit ? 'Modifier' : 'Nouveau' }} Fournisseur</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="loading" class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <form *ngIf="!loading" [formGroup]="fournisseurForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom de l'entreprise *</mat-label>
            <input matInput formControlName="nomEntreprise">
            <mat-error>Nom de l'entreprise requis</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Personne contact *</mat-label>
            <input matInput formControlName="personneContact">
            <mat-error>Personne contact requise</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email *</mat-label>
            <input matInput type="email" formControlName="email">
            <mat-error *ngIf="fournisseurForm.get('email')?.hasError('required')">Email requis</mat-error>
            <mat-error *ngIf="fournisseurForm.get('email')?.hasError('email')">Format invalide</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Téléphone</mat-label>
            <input matInput formControlName="telephone">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Adresse</mat-label>
            <textarea matInput formControlName="adresse" rows="2"></textarea>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Ville *</mat-label>
              <input matInput formControlName="ville">
              <mat-error>Ville requise</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Code postal</mat-label>
              <input matInput formControlName="codePostal">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Pays *</mat-label>
            <input matInput formControlName="pays">
            <mat-error>Pays requis</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Spécialités produits</mat-label>
            <textarea matInput formControlName="specialitesProduits" rows="2"></textarea>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Délai livraison (jours) *</mat-label>
              <input matInput type="number" formControlName="delaiLivraisonJours" min="0">
              <mat-error>Délai requis</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Conditions de paiement</mat-label>
              <input matInput formControlName="conditionsPaiement">
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="!fournisseurForm.valid || saving">
              {{ saving ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer') }}
            </button>
            <button mat-button type="button" (click)="onCancel()">Annuler</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-card { max-width: 700px; margin: 20px auto; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .half-width { width: calc(50% - 8px); margin-bottom: 12px; }
    .form-row { display: flex; gap: 16px; }
    .form-actions { display: flex; gap: 16px; margin-top: 8px; }
    .loading { display: flex; justify-content: center; padding: 40px; }
  `]
})
export class FournisseurFormComponent implements OnInit {
  fournisseurForm: FormGroup;
  isEdit = false;
  loading = false;
  saving = false;
  private fournisseurId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar
  ) {
    this.fournisseurForm = this.fb.group({
      nomEntreprise: ['', Validators.required],
      personneContact: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      adresse: [''],
      ville: ['', Validators.required],
      pays: ['', Validators.required],
      codePostal: [''],
      specialitesProduits: [''],
      delaiLivraisonJours: [0, [Validators.required, Validators.min(0)]],
      conditionsPaiement: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.fournisseurId = +id;
      this.loading = true;
      this.fournisseurService.getById(this.fournisseurId).subscribe({
        next: (fournisseur) => {
          this.fournisseurForm.patchValue(fournisseur);
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Erreur lors du chargement du fournisseur', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.fournisseurForm.valid) return;
    this.saving = true;
    const data = this.fournisseurForm.value;

    const request = this.isEdit && this.fournisseurId
      ? this.fournisseurService.update(this.fournisseurId, data)
      : this.fournisseurService.create(data);

    request.subscribe({
      next: () => {
        this.snackBar.open(this.isEdit ? 'Fournisseur modifié' : 'Fournisseur créé', 'Fermer', { duration: 3000 });
        this.router.navigate(['/clients-fournisseurs']);
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/clients-fournisseurs']);
  }
}
