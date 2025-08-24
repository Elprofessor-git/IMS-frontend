import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-parametres',
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
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="parametres-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>settings</mat-icon>
            Paramètres Système
          </mat-card-title>
          <mat-card-subtitle>
            Configuration générale de l'application
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="parametresForm" (ngSubmit)="onSubmit()">
            <!-- Paramètres Généraux -->
            <div class="section">
              <h3>Paramètres Généraux</h3>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Nom de l'Entreprise</mat-label>
                  <input matInput formControlName="nomEntreprise" placeholder="Votre entreprise">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Devise</mat-label>
                  <mat-select formControlName="devise">
                    <mat-option value="EUR">Euro (€)</mat-option>
                    <mat-option value="USD">Dollar ($)</mat-option>
                    <mat-option value="GBP">Livre (£)</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Langue</mat-label>
                  <mat-select formControlName="langue">
                    <mat-option value="fr">Français</mat-option>
                    <mat-option value="en">English</mat-option>
                    <mat-option value="es">Español</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Fuseau Horaire</mat-label>
                  <mat-select formControlName="fuseauHoraire">
                    <mat-option value="Europe/Paris">Europe/Paris</mat-option>
                    <mat-option value="UTC">UTC</mat-option>
                    <mat-option value="America/New_York">America/New_York</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Paramètres Stock -->
            <div class="section">
              <h3>Paramètres Stock</h3>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Seuil d'Alerte Stock (%)</mat-label>
                  <input matInput type="number" formControlName="seuilAlerteStock" min="0" max="100">
                  <mat-icon matSuffix>percent</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Stock Minimum</mat-label>
                  <input matInput type="number" formControlName="stockMinimum" min="0">
                  <mat-icon matSuffix>inventory</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Délai Réapprovisionnement (jours)</mat-label>
                  <input matInput type="number" formControlName="delaiReappro" min="1">
                  <mat-icon matSuffix>schedule</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Paramètres Notifications -->
            <div class="section">
              <h3>Paramètres Notifications</h3>
              <div class="form-grid">
                <div class="switch-item">
                  <span>Alertes Stock Faible</span>
                  <mat-slide-toggle formControlName="alertesStock"></mat-slide-toggle>
                </div>

                <div class="switch-item">
                  <span>Notifications Commandes</span>
                  <mat-slide-toggle formControlName="notificationsCommandes"></mat-slide-toggle>
                </div>

                <div class="switch-item">
                  <span>Rapports Automatiques</span>
                  <mat-slide-toggle formControlName="rapportsAutomatiques"></mat-slide-toggle>
                </div>

                <div class="switch-item">
                  <span>Chatbot IA</span>
                  <mat-slide-toggle formControlName="chatbotIA"></mat-slide-toggle>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Paramètres Sécurité -->
            <div class="section">
              <h3>Paramètres Sécurité</h3>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Durée Session (minutes)</mat-label>
                  <input matInput type="number" formControlName="dureeSession" min="15" max="480">
                  <mat-icon matSuffix>security</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Complexité Mot de Passe</mat-label>
                  <mat-select formControlName="complexiteMdp">
                    <mat-option value="faible">Faible (6 caractères)</mat-option>
                    <mat-option value="moyenne">Moyenne (8 caractères)</mat-option>
                    <mat-option value="forte">Forte (12 caractères)</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="switch-item">
                  <span>Authentification 2FA</span>
                  <mat-slide-toggle formControlName="authentification2FA"></mat-slide-toggle>
                </div>

                <div class="switch-item">
                  <span>Logs d'Activité</span>
                  <mat-slide-toggle formControlName="logsActivite"></mat-slide-toggle>
                </div>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="actions">
              <button mat-button type="button" (click)="resetForm()">
                <mat-icon>refresh</mat-icon>
                Réinitialiser
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!parametresForm.valid">
                <mat-icon>save</mat-icon>
                Enregistrer
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .parametres-container {
      padding: 20px;
    }

    .section {
      margin-bottom: 30px;
    }

    .section h3 {
      margin-bottom: 16px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .switch-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #f9f9f9;
      border-radius: 8px;
      border: 1px solid #eee;
    }

    .switch-item span {
      font-weight: 500;
      color: #333;
    }

    .actions {
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

      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class ParametresComponent implements OnInit {
  parametresForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.parametresForm = this.fb.group({
      // Paramètres généraux
      nomEntreprise: ['Textile Pro', Validators.required],
      devise: ['EUR', Validators.required],
      langue: ['fr', Validators.required],
      fuseauHoraire: ['Europe/Paris', Validators.required],

      // Paramètres stock
      seuilAlerteStock: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
      stockMinimum: [10, [Validators.required, Validators.min(0)]],
      delaiReappro: [7, [Validators.required, Validators.min(1)]],

      // Paramètres notifications
      alertesStock: [true],
      notificationsCommandes: [true],
      rapportsAutomatiques: [false],
      chatbotIA: [true],

      // Paramètres sécurité
      dureeSession: [30, [Validators.required, Validators.min(15), Validators.max(480)]],
      complexiteMdp: ['moyenne', Validators.required],
      authentification2FA: [false],
      logsActivite: [true]
    });
  }

  ngOnInit(): void {
    // Charger les paramètres existants
    this.loadParametres();
  }

  loadParametres(): void {
    // Simuler le chargement des paramètres depuis l'API
    // En réalité, cela viendrait du backend
  }

  onSubmit(): void {
    if (this.parametresForm.valid) {
      console.log('Paramètres sauvegardés:', this.parametresForm.value);
      this.snackBar.open('Paramètres sauvegardés avec succès', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  resetForm(): void {
    this.parametresForm.reset({
      nomEntreprise: 'Textile Pro',
      devise: 'EUR',
      langue: 'fr',
      fuseauHoraire: 'Europe/Paris',
      seuilAlerteStock: 20,
      stockMinimum: 10,
      delaiReappro: 7,
      alertesStock: true,
      notificationsCommandes: true,
      rapportsAutomatiques: false,
      chatbotIA: true,
      dureeSession: 30,
      complexiteMdp: 'moyenne',
      authentification2FA: false,
      logsActivite: true
    });

    this.snackBar.open('Formulaire réinitialisé', 'Fermer', {
      duration: 2000
    });
  }
}