import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
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
import { MatTableModule } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';

import { CommandeService } from '../../core/services/commande.service';
import { ClientService } from '../../core/services/client.service';
import { StockService } from '../../core/services/stock.service';

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
    MatTableModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>shopping_cart</mat-icon>
            {{ isEdit ? 'Modifier' : 'Nouvelle' }} Commande
          </mat-card-title>
          <mat-card-subtitle>{{ isEdit ? 'Modifier une commande existante' : 'Créer une nouvelle commande client' }}</mat-card-subtitle>
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
                <mat-error *ngIf="commandeForm.get('dateCommande')?.hasError('required')">
                  La date est requise
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Titre de la commande</mat-label>
              <input matInput formControlName="titreCommande" placeholder="Ex: Commande textile printemps 2024" required>
              <mat-icon matSuffix>title</mat-icon>
              <mat-error *ngIf="commandeForm.get('titreCommande')?.hasError('required')">
                Le titre est requis
              </mat-error>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Client</mat-label>
                <mat-select formControlName="clientId" required>
                  <mat-option *ngFor="let client of clients" [value]="client.id">
                    {{ client.nom }} {{ client.prenom }}
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="commandeForm.get('clientId')?.hasError('required')">
                  Veuillez sélectionner un client
                </mat-error>
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
                <mat-icon matSuffix>flag</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Priorité</mat-label>
                <mat-select formControlName="priorite">
                  <mat-option value="Basse">Basse</mat-option>
                  <mat-option value="Normale">Normale</mat-option>
                  <mat-option value="Haute">Haute</mat-option>
                  <mat-option value="Urgente">Urgente</mat-option>
                </mat-select>
                <mat-icon matSuffix>priority_high</mat-icon>
              </mat-form-field>
            </div>

            <!-- Articles de la commande -->
            <div class="section-header">
              <mat-icon>inventory</mat-icon>
              <h3>Articles commandés</h3>
              <button mat-icon-button type="button" (click)="ajouterLigne()" color="primary">
                <mat-icon>add</mat-icon>
              </button>
            </div>

            <div formArrayName="lignes" class="lignes-container">
              <div *ngFor="let ligne of getLignes().controls; let i = index" [formGroupName]="i" class="ligne-commande">
                <mat-card class="ligne-card">
                  <div class="ligne-content">
                    <mat-form-field appearance="outline" class="article-field">
                      <mat-label>Article</mat-label>
                      <mat-select formControlName="articleId" required>
                        <mat-option *ngFor="let article of articles" [value]="article.id">
                          {{ article.nom }} ({{ article.reference }})
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="quantity-field">
                      <mat-label>Quantité</mat-label>
                      <input matInput type="number" formControlName="quantite" min="1" required>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="price-field">
                      <mat-label>Prix unitaire</mat-label>
                      <input matInput type="number" formControlName="prixUnitaire" step="0.01" min="0" required>
                      <span matPrefix>€&nbsp;</span>
                    </mat-form-field>

                    <div class="total-field">
                      <strong>{{ calculerTotalLigne(i) | currency:'EUR':'symbol':'1.2-2' }}</strong>
                    </div>

                    <button mat-icon-button type="button" (click)="supprimerLigne(i)" color="warn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </mat-card>
              </div>
            </div>

            <!-- Total commande -->
            <mat-card class="total-card">
              <div class="total-content">
                <h3>Total de la commande: {{ calculerTotalCommande() | currency:'EUR':'symbol':'1.2-2' }}</h3>
              </div>
            </mat-card>

            <!-- Notes -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes et commentaires</mat-label>
              <textarea matInput formControlName="notes" rows="4" placeholder="Notes additionnelles sur la commande..."></textarea>
              <mat-icon matSuffix>note</mat-icon>
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="onCancel()">
            <mat-icon>cancel</mat-icon>
            Annuler
          </button>
          <button mat-raised-button color="primary" [disabled]="commandeForm.invalid || isSubmitting" (click)="onSubmit()">
            <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
            <mat-icon *ngIf="!isSubmitting">{{ isEdit ? 'update' : 'save' }}</mat-icon>
            <span *ngIf="!isSubmitting">{{ isEdit ? 'Modifier' : 'Créer' }} la commande</span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 900px;
      margin: 20px auto;
      padding: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .half-width {
      width: calc(50% - 8px);
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 24px 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #e0e0e0;
    }

    .section-header h3 {
      margin: 0;
      flex: 1;
      color: #1976d2;
    }

    .lignes-container {
      margin-bottom: 20px;
    }

    .ligne-commande {
      margin-bottom: 12px;
    }

    .ligne-card {
      padding: 16px;
      background: #f8f9fa;
    }

    .ligne-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .article-field {
      flex: 2;
    }

    .quantity-field, .price-field {
      flex: 1;
    }

    .total-field {
      min-width: 100px;
      text-align: right;
      color: #1976d2;
      font-size: 16px;
    }

    .total-card {
      background: #e3f2fd;
      margin: 20px 0;
    }

    .total-content {
      padding: 16px;
      text-align: right;
    }

    .total-content h3 {
      margin: 0;
      color: #1976d2;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
    }

    mat-card-actions {
      padding: 16px 24px;
      gap: 12px;
    }

    .mat-mdc-raised-button {
      min-width: 140px;
    }

    @media (max-width: 768px) {
      .form-container {
        margin: 10px;
        padding: 10px;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }

      .ligne-content {
        flex-direction: column;
        align-items: stretch;
      }

      .article-field, .quantity-field, .price-field {
        flex: none;
      }
    }
  `]
})
export class CommandeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private commandeService = inject(CommandeService);
  private clientService = inject(ClientService);
  private stockService = inject(StockService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  commandeForm: FormGroup;
  isEdit = false;
  isSubmitting = false;
  clients: any[] = [];
  articles: any[] = [];

  constructor() {
    this.commandeForm = this.fb.group({
      numeroCommande: ['', Validators.required],
      titreCommande: ['', Validators.required],
      clientId: ['', Validators.required],
      dateCommande: [new Date(), Validators.required],
      dateLivraisonPrevue: [''],
      statut: ['EnAttente', Validators.required],
      priorite: ['Normale'],
      notes: [''],
      lignes: this.fb.array([])
    });

    // Vérifier si c'est une modification
    this.isEdit = this.route.snapshot.paramMap.has('id');
  }

  ngOnInit(): void {
    this.generateNumeroCommande();
    this.loadClients();
    this.loadArticles();
    this.ajouterLigne(); // Ajouter une première ligne
  }

  private generateNumeroCommande(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    this.commandeForm.patchValue({
      numeroCommande: `CMD-${year}${month}${day}-${random}`
    });
  }

  private loadClients(): void {
    // Simuler le chargement des clients
    this.clients = [
      { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@email.com' },
      { id: 2, nom: 'Martin', prenom: 'Marie', email: 'marie.martin@email.com' },
      { id: 3, nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@email.com' }
    ];
  }

  private loadArticles(): void {
    // Simuler le chargement des articles
    this.articles = [
      { id: 1, nom: 'T-shirt coton', reference: 'TSH-001', prix: 15.99 },
      { id: 2, nom: 'Pantalon jean', reference: 'PAN-001', prix: 45.50 },
      { id: 3, nom: 'Veste cuir', reference: 'VES-001', prix: 120.00 }
    ];
  }

  getLignes(): FormArray {
    return this.commandeForm.get('lignes') as FormArray;
  }

  ajouterLigne(): void {
    const ligneForm = this.fb.group({
      articleId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]]
    });

    this.getLignes().push(ligneForm);
  }

  supprimerLigne(index: number): void {
    this.getLignes().removeAt(index);
  }

  calculerTotalLigne(index: number): number {
    const ligne = this.getLignes().at(index);
    const quantite = ligne.get('quantite')?.value || 0;
    const prix = ligne.get('prixUnitaire')?.value || 0;
    return quantite * prix;
  }

  calculerTotalCommande(): number {
    let total = 0;
    for (let i = 0; i < this.getLignes().length; i++) {
      total += this.calculerTotalLigne(i);
    }
    return total;
  }

  onSubmit(): void {
    if (this.commandeForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const commandeData = {
      ...this.commandeForm.value,
      totalCommande: this.calculerTotalCommande()
    };

    

    // Simuler l'appel API
    setTimeout(() => {
      this.isSubmitting = false;
      this.snackBar.open('Commande créée avec succès!', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.router.navigate(['/commandes']);
    }, 1000);
  }

  onCancel(): void {
    this.router.navigate(['/commandes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.commandeForm.controls).forEach(key => {
      const control = this.commandeForm.get(key);
      control?.markAsTouched();
    });
  }
}


