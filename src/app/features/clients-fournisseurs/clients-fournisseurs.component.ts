import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { FournisseurService } from '../../core/services/fournisseur.service';
import { Client } from '../../shared/models/commande.model';
import { Fournisseur } from '../../shared/models/common.model';

@Component({
  selector: 'app-clients-fournisseurs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="clients-fournisseurs-container">
      <div class="page-header">
        <h1>Gestion des Partenaires</h1>
        <p>Gestion des clients et fournisseurs</p>
      </div>

      <mat-card class="main-card">
        <mat-tab-group>
          <!-- Onglet Clients -->
          <mat-tab label="Clients">
            <div class="tab-content">
              <div class="toolbar">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Rechercher un client</mat-label>
                  <input matInput [formControl]="clientSearchControl" placeholder="Nom, email...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <button mat-raised-button color="primary" (click)="addClient()">
                  <mat-icon>add</mat-icon>
                  Nouveau Client
                </button>
              </div>

              <div class="table-container">
                <table mat-table [dataSource]="clients" class="clients-table">
                  <ng-container matColumnDef="nom">
                    <th mat-header-cell *matHeaderCellDef>Nom</th>
                    <td mat-cell *matCellDef="let client">{{ client.nom }}</td>
                  </ng-container>

                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>Email</th>
                    <td mat-cell *matCellDef="let client">{{ client.email }}</td>
                  </ng-container>

                  <ng-container matColumnDef="telephone">
                    <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                    <td mat-cell *matCellDef="let client">{{ client.telephone || '-' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="actif">
                    <th mat-header-cell *matHeaderCellDef>Statut</th>
                    <td mat-cell *matCellDef="let client">
                      <mat-chip [color]="client.estActif ? 'primary' : 'warn'" selected>
                        {{ client.estActif ? 'Actif' : 'Inactif' }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let client">
                      <button mat-icon-button (click)="editClient(client.id)"
                              matTooltip="Modifier">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button (click)="toggleClientStatus(client)"
                              [matTooltip]="client.estActif ? 'Désactiver' : 'Activer'">
                        <mat-icon>{{ client.estActif ? 'block' : 'check_circle' }}</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="clientColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: clientColumns;"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Fournisseurs -->
          <mat-tab label="Fournisseurs">
            <div class="tab-content">
              <div class="toolbar">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Rechercher un fournisseur</mat-label>
                  <input matInput [formControl]="fournisseurSearchControl" placeholder="Nom, spécialité...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <button mat-raised-button color="primary" (click)="addFournisseur()">
                  <mat-icon>add</mat-icon>
                  Nouveau Fournisseur
                </button>
              </div>

              <div class="table-container">
                <table mat-table [dataSource]="fournisseurs" class="fournisseurs-table">
                  <ng-container matColumnDef="nom">
                    <th mat-header-cell *matHeaderCellDef>Nom</th>
                    <td mat-cell *matCellDef="let fournisseur">{{ fournisseur.nomEntreprise }}</td>
                  </ng-container>

                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>Email</th>
                    <td mat-cell *matCellDef="let fournisseur">{{ fournisseur.email }}</td>
                  </ng-container>

                  <ng-container matColumnDef="specialite">
                    <th mat-header-cell *matHeaderCellDef>Spécialité</th>
                    <td mat-cell *matCellDef="let fournisseur">{{ fournisseur.specialitesProduits || '-' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="actif">
                    <th mat-header-cell *matHeaderCellDef>Statut</th>
                    <td mat-cell *matCellDef="let fournisseur">
                      <mat-chip [color]="fournisseur.estActif ? 'primary' : 'warn'" selected>
                        {{ fournisseur.estActif ? 'Actif' : 'Inactif' }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let fournisseur">
                      <button mat-icon-button (click)="editFournisseur(fournisseur.id)"
                              matTooltip="Modifier">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button (click)="toggleFournisseurStatus(fournisseur)"
                              [matTooltip]="fournisseur.estActif ? 'Désactiver' : 'Activer'">
                        <mat-icon>{{ fournisseur.estActif ? 'block' : 'check_circle' }}</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="fournisseurColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: fournisseurColumns;"></tr>
                </table>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .clients-fournisseurs-container {
      padding: 20px;
    }

    .page-header {
      margin-bottom: 20px;
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .page-header p {
      margin: 0;
      color: #666;
    }

    .main-card {
      min-height: 600px;
    }

    .tab-content {
      padding: 20px;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .search-field {
      width: 300px;
    }

    .table-container {
      overflow-x: auto;
    }

    .clients-table,
    .fournisseurs-table {
      width: 100%;
    }

    .mat-mdc-cell,
    .mat-mdc-header-cell {
      padding: 12px 8px;
    }

    @media (max-width: 768px) {
      .toolbar {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .search-field {
        width: 100%;
      }
    }
  `]
})
export class ClientsFournisseursComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  clientSearchControl = new FormControl('');
  fournisseurSearchControl = new FormControl('');

  clientColumns = ['nom', 'email', 'telephone', 'actif', 'actions'];
  fournisseurColumns = ['nom', 'email', 'specialite', 'actif', 'actions'];

  clients: Client[] = [];
  fournisseurs: Fournisseur[] = [];
  loadingClients = false;
  loadingFournisseurs = false;

  constructor(
    private router: Router,
    private clientService: ClientService,
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadFournisseurs();

    this.clientSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.loadClients());

    this.fournisseurSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.loadFournisseurs());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClients(): void {
    this.loadingClients = true;
    this.clientService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => { this.clients = data; this.loadingClients = false; },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 3000 });
        this.loadingClients = false;
      }
    });
  }

  loadFournisseurs(): void {
    this.loadingFournisseurs = true;
    this.fournisseurService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => { this.fournisseurs = data; this.loadingFournisseurs = false; },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des fournisseurs', 'Fermer', { duration: 3000 });
        this.loadingFournisseurs = false;
      }
    });
  }

  addClient(): void {
    this.router.navigate(['/clients-fournisseurs/clients/nouveau']);
  }

  editClient(clientId: number): void {
    this.router.navigate(['/clients-fournisseurs/clients', clientId]);
  }

  toggleClientStatus(client: Client): void {
    this.clientService.toggleStatus(client.id).subscribe({
      next: () => this.loadClients(),
      error: () => this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 })
    });
  }

  addFournisseur(): void {
    this.router.navigate(['/clients-fournisseurs/fournisseurs/nouveau']);
  }

  editFournisseur(fournisseurId: number): void {
    this.router.navigate(['/clients-fournisseurs/fournisseurs', fournisseurId]);
  }

  toggleFournisseurStatus(fournisseur: Fournisseur): void {
    this.fournisseurService.toggleStatus(fournisseur.id).subscribe({
      next: () => this.loadFournisseurs(),
      error: () => this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 })
    });
  }
}


