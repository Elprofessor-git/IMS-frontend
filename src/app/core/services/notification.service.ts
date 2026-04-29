import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top'
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string, action?: string): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['success-snackbar']
    });
  }

  error(message: string, action?: string): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  warning(message: string, action?: string): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['warning-snackbar']
    });
  }

  info(message: string, action?: string): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['info-snackbar']
    });
  }
}


