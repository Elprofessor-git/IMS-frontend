import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tache-form',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>add_task</mat-icon>
            Formulaire Tâche
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Fonctionnalité en cours de développement</p>
          <p>Ce formulaire permettra de créer et modifier des tâches de production.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary">Sauvegarder</button>
          <button mat-button>Annuler</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class TacheFormComponent {}
