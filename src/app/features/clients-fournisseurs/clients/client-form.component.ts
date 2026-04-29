import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ isEdit ? 'Modifier' : 'Ajouter' }} un Client</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" required>
            <mat-error *ngIf="clientForm.get('nom')?.hasError('required')">
              Le nom est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" required>
            <mat-error *ngIf="clientForm.get('email')?.hasError('required')">
              L'email est requis
            </mat-error>
            <mat-error *ngIf="clientForm.get('email')?.hasError('email')">
              Format d'email invalide
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Téléphone</mat-label>
            <input matInput formControlName="telephone">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Adresse</mat-label>
            <textarea matInput formControlName="adresse" rows="3"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="!clientForm.valid">
              {{ isEdit ? 'Modifier' : 'Ajouter' }}
            </button>
            <button mat-button type="button" (click)="onCancel()">
              Annuler
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .form-actions {
      display: flex;
      gap: 16px;
      margin-top: 16px;
    }
    mat-card {
      max-width: 600px;
      margin: 20px auto;
    }
  `]
})
export class ClientFormComponent {
  clientForm: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      adresse: ['']
    });

    // Vérifier si c'est une modification
    this.isEdit = this.route.snapshot.paramMap.has('id');
  }

  onSubmit() {
    if (this.clientForm.valid) {
      
      // Ici, vous ajouteriez la logique pour sauvegarder le client
      this.router.navigate(['/clients-fournisseurs/clients']);
    }
  }

  onCancel() {
    this.router.navigate(['/clients-fournisseurs/clients']);
  }
}


