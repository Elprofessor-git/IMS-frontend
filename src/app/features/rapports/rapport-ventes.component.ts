import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-rapport-ventes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="rapport-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>trending_up</mat-icon>
            Rapport de Ventes
          </mat-card-title>
          <mat-card-subtitle>
            Analyse des performances commerciales
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="stats-grid">
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-value">€12,450</div>
                <div class="stat-label">Chiffre d'Affaires (30j)</div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-value">45</div>
                <div class="stat-label">Commandes Traitées</div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-value">€276</div>
                <div class="stat-label">Panier Moyen</div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-value">+15%</div>
                <div class="stat-label">Croissance (vs mois précédent)</div>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="tableau-section">
            <h3>Top 10 des Produits Vendus</h3>
            <table mat-table [dataSource]="topProduits" class="mat-elevation-z1">
              <ng-container matColumnDef="position">
                <th mat-header-cell *matHeaderCellDef> # </th>
                <td mat-cell *matCellDef="let produit"> {{produit.position}} </td>
              </ng-container>

              <ng-container matColumnDef="produit">
                <th mat-header-cell *matHeaderCellDef> Produit </th>
                <td mat-cell *matCellDef="let produit"> {{produit.nom}} </td>
              </ng-container>

              <ng-container matColumnDef="quantite">
                <th mat-header-cell *matHeaderCellDef> Quantité </th>
                <td mat-cell *matCellDef="let produit"> {{produit.quantite}} </td>
              </ng-container>

              <ng-container matColumnDef="ca">
                <th mat-header-cell *matHeaderCellDef> CA </th>
                <td mat-cell *matCellDef="let produit"> €{{produit.ca}} </td>
              </ng-container>

              <ng-container matColumnDef="evolution">
                <th mat-header-cell *matHeaderCellDef> Évolution </th>
                <td mat-cell *matCellDef="let produit">
                  <mat-chip [color]="produit.evolution > 0 ? 'primary' : 'warn'" selected>
                    {{produit.evolution > 0 ? '+' : ''}}{{produit.evolution}}%
                  </mat-chip>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="colonnesProduits"></tr>
              <tr mat-row *matRowDef="let row; columns: colonnesProduits;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .rapport-container {
      padding: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 600;
      color: #1976d2;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
    }

    .tableau-section {
      margin-top: 30px;
    }

    .tableau-section h3 {
      margin-bottom: 16px;
      color: #333;
    }

    table {
      width: 100%;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RapportVentesComponent implements OnInit {
  colonnesProduits: string[] = ['position', 'produit', 'quantite', 'ca', 'evolution'];

  topProduits = [
    { position: 1, nom: 'T-Shirt Coton Bio', quantite: 150, ca: 2250, evolution: 12 },
    { position: 2, nom: 'Pantalon Denim', quantite: 89, ca: 1780, evolution: 8 },
    { position: 3, nom: 'Chemise Lin', quantite: 67, ca: 1340, evolution: -3 },
    { position: 4, nom: 'Veste Légère', quantite: 45, ca: 1350, evolution: 15 },
    { position: 5, nom: 'Robe Été', quantite: 38, ca: 1140, evolution: 22 },
    { position: 6, nom: 'Short Sport', quantite: 120, ca: 960, evolution: 5 },
    { position: 7, nom: 'Pull Hiver', quantite: 25, ca: 750, evolution: -8 },
    { position: 8, nom: 'Accessoires', quantite: 200, ca: 600, evolution: 18 },
    { position: 9, nom: 'Chaussettes', quantite: 300, ca: 450, evolution: 3 },
    { position: 10, nom: 'Écharpe Laine', quantite: 15, ca: 300, evolution: 10 }
  ];

  constructor() {}

  ngOnInit(): void {
    // Charger les données du rapport
  }
}