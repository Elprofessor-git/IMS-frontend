import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="analytics-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>insights</mat-icon>
            Analytics & KPIs
          </mat-card-title>
          <mat-card-subtitle>
            Tableaux de bord et métriques avancées
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- KPIs Principaux -->
          <div class="kpis-grid">
            <mat-card class="kpi-card">
              <mat-card-content>
                <div class="kpi-header">
                  <mat-icon color="primary">trending_up</mat-icon>
                  <span class="kpi-title">Croissance CA</span>
                </div>
                <div class="kpi-value">+23.5%</div>
                <div class="kpi-period">vs mois précédent</div>
              </mat-card-content>
            </mat-card>

            <mat-card class="kpi-card">
              <mat-card-content>
                <div class="kpi-header">
                  <mat-icon color="accent">inventory</mat-icon>
                  <span class="kpi-title">Rotation Stock</span>
                </div>
                <div class="kpi-value">4.2x</div>
                <div class="kpi-period">par an</div>
              </mat-card-content>
            </mat-card>

            <mat-card class="kpi-card">
              <mat-card-content>
                <div class="kpi-header">
                  <mat-icon color="warn">schedule</mat-icon>
                  <span class="kpi-title">Délai Livraison</span>
                </div>
                <div class="kpi-value">2.3j</div>
                <div class="kpi-period">moyenne</div>
              </mat-card-content>
            </mat-card>

            <mat-card class="kpi-card">
              <mat-card-content>
                <div class="kpi-header">
                  <mat-icon color="primary">star</mat-icon>
                  <span class="kpi-title">Satisfaction</span>
                </div>
                <div class="kpi-value">4.8/5</div>
                <div class="kpi-period">clients</div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Graphiques -->
          <div class="graphiques-section">
            <h3>Évolution des Performances</h3>
            <div class="graphiques-grid">
              <mat-card class="graphique-card">
                <mat-card-header>
                  <mat-card-title>Ventes Mensuelles</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="graphique-placeholder">
                    <mat-icon>insert_chart</mat-icon>
                    <p>Graphique des ventes (en développement)</p>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="graphique-card">
                <mat-card-header>
                  <mat-card-title>Répartition Stock</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="graphique-placeholder">
                    <mat-icon>pie_chart</mat-icon>
                    <p>Camembert du stock (en développement)</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Métriques Avancées -->
          <div class="metriques-section">
            <h3>Métriques Avancées</h3>
            <div class="metriques-grid">
              <mat-card class="metrique-card">
                <mat-card-content>
                  <div class="metrique-item">
                    <span class="metrique-label">Taux de Conversion</span>
                    <span class="metrique-value">3.2%</span>
                  </div>
                  <div class="metrique-item">
                    <span class="metrique-label">Panier Moyen</span>
                    <span class="metrique-value">€156</span>
                  </div>
                  <div class="metrique-item">
                    <span class="metrique-label">Taux de Retour</span>
                    <span class="metrique-value">2.1%</span>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="metrique-card">
                <mat-card-content>
                  <div class="metrique-item">
                    <span class="metrique-label">Stock Sécurité</span>
                    <span class="metrique-value">87%</span>
                  </div>
                  <div class="metrique-item">
                    <span class="metrique-label">Efficacité Production</span>
                    <span class="metrique-value">94%</span>
                  </div>
                  <div class="metrique-item">
                    <span class="metrique-label">Qualité Produits</span>
                    <span class="metrique-value">98.5%</span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 20px;
    }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .kpi-card {
      text-align: center;
    }

    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .kpi-title {
      font-weight: 500;
      color: #666;
    }

    .kpi-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1976d2;
      margin-bottom: 4px;
    }

    .kpi-period {
      font-size: 0.85rem;
      color: #999;
    }

    .graphiques-section {
      margin-bottom: 30px;
    }

    .graphiques-section h3 {
      margin-bottom: 16px;
      color: #333;
    }

    .graphiques-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .graphique-card {
      height: 300px;
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

    .metriques-section h3 {
      margin-bottom: 16px;
      color: #333;
    }

    .metriques-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .metrique-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .metrique-item:last-child {
      border-bottom: none;
    }

    .metrique-label {
      font-weight: 500;
      color: #666;
    }

    .metrique-value {
      font-weight: 600;
      color: #1976d2;
    }

    @media (max-width: 768px) {
      .kpis-grid,
      .graphiques-grid,
      .metriques-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
    // Charger les données analytics
  }
}