import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-tache-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  template: `
    <div class="details-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>task</mat-icon>
            Détails de la Tâche
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="task-info">
            <h3>Production Lot A</h3>
            <p>Production de 1000 unités du lot A</p>

            <div class="task-meta">
              <mat-chip color="warn" selected>
                <mat-icon>priority_high</mat-icon>
                Haute priorité
              </mat-chip>

              <mat-chip color="accent" selected>
                <mat-icon>play_arrow</mat-icon>
                En cours
              </mat-chip>
            </div>

            <div class="progress-section">
              <h4>Progression</h4>
              <mat-progress-bar value="65" color="accent"></mat-progress-bar>
              <span class="progress-text">65%</span>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary">
            <mat-icon>edit</mat-icon>
            Modifier
          </button>
          <button mat-button>
            <mat-icon>check_circle</mat-icon>
            Terminer
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .details-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .task-meta {
      display: flex;
      gap: 8px;
      margin: 16px 0;
    }
    .progress-section {
      margin-top: 24px;
    }
    .progress-section h4 {
      margin: 0 0 8px 0;
    }
    .progress-text {
      font-size: 0.9rem;
      color: #666;
      margin-left: 8px;
    }
  `]
})
export class TacheDetailsComponent {}


