import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StockService, Stock, Article } from '../../core/services/stock.service';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './stock-form.component.html',
  styleUrls: ['./stock-form.component.scss']
})
export class StockFormComponent implements OnInit {
  form: FormGroup;
  isEditMode: boolean;
  isLoading = false;
  articles: Article[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StockFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { stock?: Stock, articles: Article[] },
    private stockService: StockService
  ) {
    this.isEditMode = !!data.stock;
    this.articles = data.articles || [];

    this.form = this.fb.group({
      articleId: [null, Validators.required],
      quantite: [0, [Validators.required, Validators.min(0)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      emplacementPhysique: [''],
      couleur: [''],
      taille: [''],
      numeroLot: [''],
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.stock) {
      this.form.patchValue(this.data.stock);
      // Disable article selection in edit mode
      this.form.get('articleId')?.disable();
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    // Use getRawValue to include disabled fields like articleId in edit mode
    const stockData = this.form.getRawValue();

    const saveObservable = this.isEditMode
      ? this.stockService.updateStock(this.data.stock!.id, stockData)
      : this.stockService.createStock(stockData);

    saveObservable.subscribe({
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


