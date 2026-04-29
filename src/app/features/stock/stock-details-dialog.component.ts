import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Stock } from './stock.service';

@Component({
  selector: 'app-stock-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
  ],
  template: `
    <h2 mat-dialog-title>Détails du Stock: {{ data.stock.article?.designation }}</h2>
    <mat-dialog-content>
      <h4>Article</h4>
      <p><strong>Désignation:</strong> {{ data.stock.article?.designation }}</p>
      <p><strong>Référence:</strong> {{ data.stock.article?.reference }}</p>
      <p><strong>Catégorie:</strong> {{ data.stock.article?.categorie }}</p>

      <h4>Détails du Stock</h4>
      <p><strong>ID Stock:</strong> {{ data.stock.id }}</p>
      <p><strong>Couleur:</strong> {{ data.stock.couleur || 'N/A' }}</p>
      <p><strong>Taille:</strong> {{ data.stock.taille || 'N/A' }}</p>
      <p><strong>Emplacement:</strong> {{ data.stock.emplacementPhysique || 'N/A' }}</p>
      <p><strong>Quantité:</strong> {{ data.stock.quantite }}</p>
      <p><strong>Quantité Réservée:</strong> {{ data.stock.quantiteReservee }}</p>
      <p><strong>Prix Unitaire:</strong> {{ data.stock.prixUnitaire | currency:'EUR' }}</p>
      <p><strong>Date d'entrée:</strong> {{ data.stock.dateEntree | date:'longDate' }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Fermer</button>
    </mat-dialog-actions>
  `
})
export class StockDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StockDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { stock: Stock }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}


