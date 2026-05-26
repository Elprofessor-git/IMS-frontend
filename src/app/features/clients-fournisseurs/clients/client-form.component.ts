import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { PlateformeService } from '../../../core/services/plateforme.service';
import { Plateforme } from '../../../shared/models/common.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card class="form-card">
      <mat-card-header>
        <mat-card-title>{{ isEdit ? 'Modifier' : 'Nouveau' }} Client</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="loading" class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <form *ngIf="!loading" [formGroup]="clientForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="nom">
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="prenom">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom de l'entreprise</mat-label>
            <input matInput formControlName="nomEntreprise">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email *</mat-label>
            <input matInput type="email" formControlName="email">
            <mat-error *ngIf="clientForm.get('email')?.hasError('required')">Email requis</mat-error>
            <mat-error *ngIf="clientForm.get('email')?.hasError('email')">Format invalide</mat-error>
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
            <mat-label>Plateforme *</mat-label>
            <mat-select formControlName="plateformeId">
              <mat-option *ngFor="let p of plateformes" [value]="p.id">{{ p.nom }}</mat-option>
            </mat-select>
            <mat-error>Plateforme requise</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Préférences tissus</mat-label>
            <textarea matInput formControlName="preferencesTissus" rows="2"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="!clientForm.valid || saving">
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
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEdit = false;
  loading = false;
  saving = false;
  plateformes: Plateforme[] = [];
  private clientId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private plateformeService: PlateformeService,
    private snackBar: MatSnackBar
  ) {
    this.clientForm = this.fb.group({
      nom: [''],
      prenom: [''],
      nomEntreprise: [''],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      adresse: [''],
      ville: ['', Validators.required],
      pays: ['', Validators.required],
      codePostal: [''],
      plateformeId: [null, Validators.required],
      preferencesTissus: ['']
    });
  }

  ngOnInit(): void {
    this.plateformeService.getAll().subscribe({
      next: (p) => this.plateformes = p,
      error: () => this.snackBar.open('Erreur lors du chargement des plateformes', 'Fermer', { duration: 3000 })
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.clientId = +id;
      this.loading = true;
      this.clientService.getById(this.clientId).subscribe({
        next: (client) => {
          this.clientForm.patchValue(client);
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Erreur lors du chargement du client', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.clientForm.valid) return;
    this.saving = true;
    const data = this.clientForm.value;

    const request = this.isEdit && this.clientId
      ? this.clientService.update(this.clientId, data)
      : this.clientService.create(data);

    request.subscribe({
      next: () => {
        this.snackBar.open(this.isEdit ? 'Client modifié' : 'Client créé', 'Fermer', { duration: 3000 });
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
