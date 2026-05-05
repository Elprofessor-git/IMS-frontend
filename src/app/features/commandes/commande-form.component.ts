import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute } from '@angular/router';

import { CommandeService } from './commande.service';
import { ClientService } from '../../core/services/client.service';
import { ModeleBomService, ModeleBom } from './modele-bom.service';

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
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>shopping_cart</mat-icon>
            {{ isEdit ? 'Modifier' : 'Nouvel' }} Ordre de Fabrication
          </mat-card-title>
          <mat-card-subtitle>{{ isEdit ? 'Modifier un ordre existant' : 'Créer un nouvel ordre de fabrication' }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="commandeForm" (ngSubmit)="onSubmit()">

            <!-- Informations générales -->
            <div class="section-header">
              <mat-icon>info</mat-icon>
              <h3>Informations générales</h3>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Numéro de commande</mat-label>
                <input matInput formControlName="numeroCommande" readonly>
                <mat-icon matSuffix>confirmation_number</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Date de commande</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dateCommande" required>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="commandeForm.get('dateCommande')?.hasError('required')">Date requise</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Client</mat-label>
                <mat-select formControlName="clientId" required>
                  <mat-option *ngFor="let c of clients" [value]="c.id">
                    {{ c.nom }} {{ c.prenom }}
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="commandeForm.get('clientId')?.hasError('required')">Client requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Date de livraison prévue</mat-label>
                <input matInput [matDatepicker]="picker2" formControlName="dateLivraisonPrevue">
                <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
                <mat-datepicker #picker2></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Statut</mat-label>
                <mat-select formControlName="statut" required>
                  <mat-option value="EnAttente">En Attente</mat-option>
                  <mat-option value="EnCours">En Cours</mat-option>
                  <mat-option value="Terminee">Terminée</mat-option>
                  <mat-option value="Annulee">Annulée</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Priorité</mat-label>
                <mat-select formControlName="priorite">
                  <mat-option value="Basse">Basse</mat-option>
                  <mat-option value="Normale">Normale</mat-option>
                  <mat-option value="Haute">Haute</mat-option>
                  <mat-option value="Urgente">Urgente</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Modèle BOM -->
            <div class="section-header">
              <mat-icon>account_tree</mat-icon>
              <h3>Modèle de fabrication (BOM)</h3>
              <a mat-icon-button routerLink="/commandes/modeles-bom" matTooltip="Gérer les modèles BOM" target="_blank">
                <mat-icon>open_in_new</mat-icon>
              </a>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Modèle BOM</mat-label>
              <mat-select formControlName="modeleBomId" required (selectionChange)="onBomChange($event.value)">
                <mat-option [value]="null">-- Sélectionner un modèle --</mat-option>
                <mat-option *ngFor="let bom of modelesBom" [value]="bom.id">
                  {{ bom.nom }} ({{ bom.fournitures?.length || 0 }} fournitures)
                </mat-option>
              </mat-select>
              <mat-error *ngIf="commandeForm.get('modeleBomId')?.hasError('required')">Modèle BOM requis</mat-error>
            </mat-form-field>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Quantités par taille -->
            <div class="section-header">
              <mat-icon>straighten</mat-icon>
              <h3>Quantités par taille</h3>
            </div>

            <div formGroupName="tailles" class="tailles-grid">
              <mat-form-field appearance="outline" *ngFor="let taille of taillesList" class="taille-field">
                <mat-label>{{ taille }}</mat-label>
                <input matInput type="number" [formControlName]="taille" min="0" (input)="recalculerTotal()">
              </mat-form-field>
            </div>

            <div class="total-pieces-row">
              <mat-icon>inventory_2</mat-icon>
              <span>Total pièces :&nbsp;</span>
              <strong class="total-pieces-value">{{ nbPieces }}</strong>
              <span>&nbsp;pcs</span>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Sécurité -->
            <div class="section-header">
              <mat-icon>security</mat-icon>
              <h3>Marge de sécurité</h3>
            </div>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>% Sécurité</mat-label>
              <input matInput type="number" formControlName="pctSecurite" min="0" max="100">
              <span matSuffix>%</span>
              <mat-hint>Marge ajoutée aux besoins calculés (défaut : 5 %)</mat-hint>
              <mat-error *ngIf="commandeForm.get('pctSecurite')?.hasError('min')">Minimum 0 %</mat-error>
              <mat-error *ngIf="commandeForm.get('pctSecurite')?.hasError('max')">Maximum 100 %</mat-error>
            </mat-form-field>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Notes -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes et commentaires</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
              <mat-icon matSuffix>note</mat-icon>
            </mat-form-field>

          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="onCancel()">
            <mat-icon>cancel</mat-icon>
            Annuler
          </button>
          <button mat-raised-button color="accent" type="button"
                  [disabled]="!commandeForm.get('modeleBomId')?.value || nbPieces === 0"
                  (click)="voirFaisabilite()">
            <mat-icon>fact_check</mat-icon>
            Vérifier faisabilité
          </button>
          <button mat-raised-button color="primary"
                  [disabled]="commandeForm.invalid || isSubmitting || nbPieces === 0"
                  (click)="onSubmit()">
            <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
            <mat-icon *ngIf="!isSubmitting">{{ isEdit ? 'update' : 'save' }}</mat-icon>
            <span *ngIf="!isSubmitting">{{ isEdit ? 'Modifier' : 'Créer' }}</span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container { max-width: 860px; margin: 20px auto; padding: 0 16px; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .half-width { width: calc(50% - 8px); margin-bottom: 12px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .section-header { display: flex; align-items: center; gap: 8px; margin: 20px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e3f2fd; }
    .section-header h3 { margin: 0; flex: 1; color: #1976d2; font-size: 1rem; }
    .section-divider { margin: 8px 0 4px; }
    .tailles-grid { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
    .taille-field { width: calc(16.66% - 10px); min-width: 80px; }
    .total-pieces-row { display: flex; align-items: center; gap: 4px; padding: 8px 12px; background: #e3f2fd; border-radius: 8px; margin-bottom: 12px; color: #333; }
    .total-pieces-value { font-size: 1.3rem; color: #1976d2; }
    mat-card-actions { padding: 16px 24px; gap: 12px; display: flex; justify-content: flex-end; }
    @media (max-width: 768px) {
      .form-row { flex-direction: column; }
      .half-width { width: 100%; }
      .taille-field { width: calc(33% - 8px); }
    }
  `]
})
export class CommandeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private commandeService = inject(CommandeService);
  private clientService = inject(ClientService);
  private bomService = inject(ModeleBomService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  commandeForm: FormGroup;
  isEdit = false;
  isSubmitting = false;
  clients: any[] = [];
  modelesBom: ModeleBom[] = [];
  taillesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  nbPieces = 0;

  constructor() {
    this.commandeForm = this.fb.group({
      numeroCommande: [''],
      clientId: ['', Validators.required],
      dateCommande: [new Date(), Validators.required],
      dateLivraisonPrevue: [null],
      statut: ['EnAttente', Validators.required],
      priorite: ['Normale'],
      modeleBomId: [null, Validators.required],
      tailles: this.fb.group({
        XS: [0], S: [0], M: [0], L: [0], XL: [0], XXL: [0]
      }),
      pctSecurite: [5, [Validators.min(0), Validators.max(100)]],
      notes: ['']
    });

    this.isEdit = this.route.snapshot.paramMap.has('id');
  }

  ngOnInit(): void {
    this.generateNumeroCommande();
    this.loadClients();
    this.loadModelesBom();
  }

  private generateNumeroCommande(): void {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.commandeForm.patchValue({
      numeroCommande: `OF-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${rand}`
    });
  }

  private loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (data) => this.clients = data,
      error: () => {}
    });
  }

  private loadModelesBom(): void {
    this.bomService.getAll().subscribe({
      next: (data) => this.modelesBom = data,
      error: () => {}
    });
  }

  onBomChange(bomId: number | null): void {
    // Réinitialiser les tailles quand le BOM change
    if (!bomId) {
      this.commandeForm.get('tailles')?.reset({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
      this.nbPieces = 0;
    }
  }

  recalculerTotal(): void {
    const tailles = this.commandeForm.get('tailles')?.value || {};
    this.nbPieces = Object.values(tailles).reduce((s: number, v: any) => s + (Number(v) || 0), 0);
  }

  voirFaisabilite(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/commandes', id, 'details']);
    } else {
      this.snackBar.open('Sauvegardez d\'abord la commande pour voir la faisabilité', 'OK', { duration: 4000 });
    }
  }

  onSubmit(): void {
    if (this.commandeForm.invalid || this.isSubmitting) {
      Object.keys(this.commandeForm.controls).forEach(k => this.commandeForm.get(k)?.markAsTouched());
      return;
    }
    if (this.nbPieces === 0) {
      this.snackBar.open('Veuillez saisir au moins une pièce dans les tailles', 'OK', { duration: 4000 });
      return;
    }

    this.isSubmitting = true;
    const payload = { ...this.commandeForm.value, nbPieces: this.nbPieces };

    this.commandeService.createCommande(payload).subscribe({
      next: (commande: any) => {
        this.snackBar.open('Ordre de fabrication créé avec succès', 'OK', { duration: 3000 });
        this.router.navigate(['/commandes', commande.id, 'details']);
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erreur serveur', 'Fermer', { duration: 5000 });
        this.isSubmitting = false;
      },
      complete: () => { this.isSubmitting = false; }
    });
  }

  onCancel(): void {
    this.router.navigate(['/commandes']);
  }
}
