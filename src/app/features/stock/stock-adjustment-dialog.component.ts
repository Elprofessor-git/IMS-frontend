import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StockService, Stock, MouvementStock, TypeMouvement, OrigineMouvement } from '../../core/services/stock.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-stock-adjustment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Ajuster le Stock pour {{ data.stock.article?.designation }}</h2>
    <mat-dialog-content [formGroup]="form">
      <p>Quantité actuelle: <strong>{{ data.stock.quantite }}</strong></p>
      <mat-form-field appearance="outline">
        <mat-label>Nouvelle Quantité</mat-label>
        <input matInput type="number" formControlName="nouvelleQuantite" required min="0">
        <mat-error *ngIf="form.get('nouvelleQuantite')?.hasError('required')">La nouvelle quantité est requise.</mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Motif de l'ajustement</mat-label>
        <textarea matInput formControlName="motif" required></textarea>
        <mat-error *ngIf="form.get('motif')?.hasError('required')">Le motif est requis.</mat-error>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="form.invalid || isLoading">
        <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
        <span *ngIf="!isLoading">Enregistrer</span>
      </button>
    </mat-dialog-actions>
  `
})
export class StockAdjustmentDialogComponent {
  form: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StockAdjustmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { stock: Stock },
    private stockService: StockService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      nouvelleQuantite: [data.stock.quantite, [Validators.required, Validators.min(0)]],
      motif: ['', Validators.required],
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    const mouvement: Partial<MouvementStock> = {
      stockId: this.data.stock.id,
      typeMouvement: TypeMouvement.Ajustement,
      origineMouvement: OrigineMouvement.Ajustement,
      quantite: this.form.value.nouvelleQuantite, // For adjustments, 'quantite' is the final value
      motif: this.form.value.motif,
      effectuePar: currentUser?.email
    };

    this.stockService.createMouvement(mouvement).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.isLoading = false;
        // Handle error
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}


