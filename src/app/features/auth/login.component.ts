import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../shared/models/common.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Connexion</mat-card-title>
            <mat-card-subtitle>Système de Gestion Textile</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="votre@email.com">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  L'email est requis
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  Format d'email invalide
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mot de passe</mat-label>
                <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
                <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Le mot de passe est requis
                </mat-error>
                <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                  Le mot de passe doit contenir au moins 6 caractères
                </mat-error>
              </mat-form-field>

              <div class="form-actions">
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit" 
                  class="full-width"
                  [disabled]="loginForm.invalid || isSubmitting">
                  <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
                  <span *ngIf="!isSubmitting">
                    <mat-icon>login</mat-icon>
                    Se connecter
                  </span>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      width: 100%;
      max-width: 400px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .form-actions {
      margin-top: 24px;
    }
    
    mat-card {
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
    }
    
    mat-card-header {
      text-align: center;
      margin-bottom: 24px;
    }
    
    mat-card-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    mat-card-subtitle {
      color: #666;
      margin-top: 8px;
    }
    
    button[type="submit"] {
      height: 48px;
      font-size: 16px;
      font-weight: 500;
    }
    
    .mat-spinner {
      margin-right: 8px;
    }
    
    @media (max-width: 480px) {
      .login-card {
        max-width: 100%;
      }
      
      mat-card {
        padding: 24px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      const loginData: LoginRequest = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.snackBar.open('Connexion réussie', 'Fermer', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Erreur de connexion:', error);
          
          let errorMessage = 'Erreur de connexion';
          if (error.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur';
          }
          
          this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
        }
      });
    }
  }
}

