import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-commande-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ isEdit ? 'Modifier' : 'Créer' }} une Commande</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="commandeForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Numéro de commande</mat-label>
            <input matInput formControlName="numeroCommande" required>
            <mat-error *ngIf="commandeForm.get('numeroCommande')?.hasError('required')">
              Le numéro de commande est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Titre de la commande</mat-label>
            <input matInput formControlName="titreCommande" required>
            <mat-error *ngIf="commandeForm.get('titreCommande')?.hasError('required')">
              Le titre est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Client</mat-label>
            <mat-select formControlName="clientId" required>
              <mat-option *ngFor="let client of clients" [value]="client.id">
                {{ client.nom }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="commandeForm.get('clientId')?.hasError('required')">
              Veuillez sélectionner un client
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Date de commande</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dateCommande" required>
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Date de livraison prévue</mat-label>
            <input matInput [matDatepicker]="picker2" formControlName="dateLivraisonPrevue">
            <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
            <mat-datepicker #picker2></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="statut" required>
              <mat-option value="EnAttente">En Attente</mat-option>
              <mat-option value="EnCours">En Cours</mat-option>
              <mat-option value="Terminee">Terminée</mat-option>
              <mat-option value="Annulee">Annulée</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="!commandeForm.valid">
              {{ isEdit ? 'Modifier' : 'Créer' }}
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
export class CommandeFormComponent {
  commandeForm: FormGroup;
  isEdit = false;
  clients = [
    { id: 1, nom: 'Client A' },
    { id: 2, nom: 'Client B' },
    { id: 3, nom: 'Client C' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.commandeForm = this.fb.group({
      numeroCommande: ['', Validators.required],
      titreCommande: ['', Validators.required],
      clientId: ['', Validators.required],
      dateCommande: [new Date(), Validators.required],
      dateLivraisonPrevue: [''],
      statut: ['EnAttente', Validators.required],
      notes: ['']
    });

    // Vérifier si c'est une modification
    this.isEdit = this.route.snapshot.paramMap.has('id');
  }

  onSubmit() {
    if (this.commandeForm.valid) {
      console.log('Données de la commande:', this.commandeForm.value);
      // Ici, vous ajouteriez la logique pour sauvegarder la commande
      this.router.navigate(['/commandes']);
    }
  }

  onCancel() {
    this.router.navigate(['/commandes']);
  }
}

