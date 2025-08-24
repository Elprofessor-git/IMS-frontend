import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RapportService, MouvementStatistiques } from '../../core/services/rapport.service';

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
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './rapport-stock.component.html',
  styleUrls: ['./rapport-stock.component.scss']
})
export class RapportStockComponent implements OnInit {
  stats: MouvementStatistiques | null = null;
  isLoading = false;
  error: string | null = null;

  // Placeholder for alerts table
  colonnesAlertes: string[] = ['article', 'quantite', 'seuil', 'statut', 'actions'];
  alertesStock: any[] = []; // This data is not provided by the current stats endpoint

  constructor(private rapportService: RapportService) {}

  ngOnInit(): void {
    this.loadStatistiques();
  }

  loadStatistiques(): void {
    this.isLoading = true;
    this.error = null;
    // Fetch stats for the last 30 days by default
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - 30);

    this.rapportService.getStatistiquesMouvements(dateDebut).subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des statistiques.";
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}