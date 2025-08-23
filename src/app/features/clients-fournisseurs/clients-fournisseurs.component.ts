import { Component, OnInit } from '@angular/core';
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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

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
    MatTooltipModule
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
                      <mat-chip [color]="client.actif ? 'primary' : 'warn'" selected>
                        {{ client.actif ? 'Actif' : 'Inactif' }}
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
                      <button mat-icon-button (click)="toggleClientStatus(client.id)" 
                              [matTooltip]="client.actif ? 'Désactiver' : 'Activer'">
                        <mat-icon>{{ client.actif ? 'block' : 'check_circle' }}</mat-icon>
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
                    <td mat-cell *matCellDef="let fournisseur">{{ fournisseur.nom }}</td>
                  </ng-container>

                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>Email</th>
                    <td mat-cell *matCellDef="let fournisseur">{{ fournisseur.email }}</td>
                  </ng-container>

                  <ng-container matColumnDef="specialite">
                    <th mat-header-cell *matHeaderCellDef>Spécialité</th>
                    <td mat-cell *matCellDef="let fournisseur">{{ fournisseur.specialite || '-' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="actif">
                    <th mat-header-cell *matHeaderCellDef>Statut</th>
                    <td mat-cell *matCellDef="let fournisseur">
                      <mat-chip [color]="fournisseur.actif ? 'primary' : 'warn'" selected>
                        {{ fournisseur.actif ? 'Actif' : 'Inactif' }}
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
                      <button mat-icon-button (click)="toggleFournisseurStatus(fournisseur.id)" 
                              [matTooltip]="fournisseur.actif ? 'Désactiver' : 'Activer'">
                        <mat-icon>{{ fournisseur.actif ? 'block' : 'check_circle' }}</mat-icon>
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
export class ClientsFournisseursComponent implements OnInit {
  clientSearchControl = new FormControl('');
  fournisseurSearchControl = new FormControl('');
  
  clientColumns = ['nom', 'email', 'telephone', 'actif', 'actions'];
  fournisseurColumns = ['nom', 'email', 'specialite', 'actif', 'actions'];
  
  clients = [
    { id: 1, nom: 'Client A', email: 'clienta@example.com', telephone: '0123456789', actif: true },
    { id: 2, nom: 'Client B', email: 'clientb@example.com', telephone: '0987654321', actif: true },
    { id: 3, nom: 'Client C', email: 'clientc@example.com', telephone: null, actif: false }
  ];
  
  fournisseurs = [
    { id: 1, nom: 'Fournisseur A', email: 'fournisseura@example.com', specialite: 'Tissus', actif: true },
    { id: 2, nom: 'Fournisseur B', email: 'fournisseurb@example.com', specialite: 'Accessoires', actif: true },
    { id: 3, nom: 'Fournisseur C', email: 'fournisseurc@example.com', specialite: 'Fils', actif: false }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Configuration de la recherche pour les clients
    this.clientSearchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.searchClients(searchTerm || '');
      });

    // Configuration de la recherche pour les fournisseurs
    this.fournisseurSearchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.searchFournisseurs(searchTerm || '');
      });
  }

  // Méthodes pour les clients
  addClient() {
    this.router.navigate(['/clients-fournisseurs/clients/add']);
  }

  editClient(clientId: number) {
    this.router.navigate(['/clients-fournisseurs/clients/edit', clientId]);
  }

  toggleClientStatus(clientId: number) {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      client.actif = !client.actif;
      console.log('Statut client modifié:', client);
    }
  }

  searchClients(searchTerm: string) {
    console.log('Recherche clients:', searchTerm);
    // Ici, vous implémenteriez la logique de recherche
  }

  // Méthodes pour les fournisseurs
  addFournisseur() {
    this.router.navigate(['/clients-fournisseurs/fournisseurs/add']);
  }

  editFournisseur(fournisseurId: number) {
    this.router.navigate(['/clients-fournisseurs/fournisseurs/edit', fournisseurId]);
  }

  toggleFournisseurStatus(fournisseurId: number) {
    const fournisseur = this.fournisseurs.find(f => f.id === fournisseurId);
    if (fournisseur) {
      fournisseur.actif = !fournisseur.actif;
      console.log('Statut fournisseur modifié:', fournisseur);
    }
  }

  searchFournisseurs(searchTerm: string) {
    console.log('Recherche fournisseurs:', searchTerm);
    // Ici, vous implémenteriez la logique de recherche
  }
}

