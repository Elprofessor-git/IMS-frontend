import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-rapport-stock',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="rapport-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>assessment</mat-icon>
            Rapport de Stock
          </mat-card-title>
          <mat-card-subtitle>
            Vue d'ensemble du stock et des alertes
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Statistiques générales -->
          <div class="stats-grid">
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-value">1,247</div>
                <div class="stat-label">Articles en Stock</div>
                <mat-progress-bar mode="determinate" value="85"></mat-progress-bar>
              </mat-card-content>
            </mat-card>
            
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-value">€45,230</div>
                <div class="stat-label">Valeur Totale</div>
                <mat-progress-bar mode="determinate" value="72"></mat-progress-bar>
              </mat-card-content>
            </mat-card>
            
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-value">12</div>
                <div class="stat-label">Alertes Stock</div>
                <mat-progress-bar mode="determinate" value="25" color="warn"></mat-progress-bar>
              </mat-card-content>
            </mat-card>
            
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-value">89</div>
                <div class="stat-label">Mouvements (30j)</div>
                <mat-progress-bar mode="determinate" value="65"></mat-progress-bar>
              </mat-card-content>
            </mat-card>
          </div>
          
          <!-- Tableau des alertes -->
          <div class="alertes-section">
            <h3>Alertes de Stock</h3>
            <table mat-table [dataSource]="alertesStock" class="mat-elevation-z1">
              <ng-container matColumnDef="article">
                <th mat-header-cell *matHeaderCellDef> Article </th>
                <td mat-cell *matCellDef="let alerte"> {{alerte.article}} </td>
              </ng-container>
              
              <ng-container matColumnDef="quantite">
                <th mat-header-cell *matHeaderCellDef> Quantité </th>
                <td mat-cell *matCellDef="let alerte"> {{alerte.quantite}} </td>
              </ng-container>
              
              <ng-container matColumnDef="seuil">
                <th mat-header-cell *matHeaderCellDef> Seuil Min </th>
                <td mat-cell *matCellDef="let alerte"> {{alerte.seuil}} </td>
              </ng-container>
              
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef> Statut </th>
                <td mat-cell *matCellDef="let alerte">
                  <mat-chip [color]="alerte.statut === 'Critique' ? 'warn' : 'accent'" selected>
                    {{alerte.statut}}
                  </mat-chip>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Actions </th>
                <td mat-cell *matCellDef="let alerte">
                  <button mat-icon-button color="primary" matTooltip="Commander">
                    <mat-icon>add_shopping_cart</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="colonnesAlertes"></tr>
              <tr mat-row *matRowDef="let row; columns: colonnesAlertes;"></tr>
            </table>
          </div>
          
          <!-- Graphiques -->
          <div class="graphiques-section">
            <h3>Évolution du Stock</h3>
            <div class="graphique-placeholder">
              <mat-icon>insert_chart</mat-icon>
              <p>Graphique d'évolution du stock (en cours de développement)</p>
            </div>
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
      margin-bottom: 12px;
    }
    
    .alertes-section {
      margin-bottom: 30px;
    }
    
    .alertes-section h3 {
      margin-bottom: 16px;
      color: #333;
    }
    
    table {
      width: 100%;
    }
    
    .graphiques-section {
      margin-top: 30px;
    }
    
    .graphiques-section h3 {
      margin-bottom: 16px;
      color: #333;
    }
    
    .graphique-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      background-color: #f5f5f5;
      border-radius: 8px;
      color: #666;
    }
    
    .graphique-placeholder mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 16px;
      color: #ccc;
    }
    
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RapportStockComponent implements OnInit {
  colonnesAlertes: string[] = ['article', 'quantite', 'seuil', 'statut', 'actions'];
  
  alertesStock = [
    {
      article: 'Tissu Coton Rouge',
      quantite: 5,
      seuil: 10,
      statut: 'Critique'
    },
    {
      article: 'Fil de Couture Noir',
      quantite: 8,
      seuil: 15,
      statut: 'Faible'
    },
    {
      article: 'Boutons Métalliques',
      quantite: 3,
      seuil: 20,
      statut: 'Critique'
    },
    {
      article: 'Élastique 2cm',
      quantite: 12,
      seuil: 25,
      statut: 'Faible'
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Charger les données du rapport
  }
} 