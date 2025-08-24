import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loginForm!: FormGroup;
  loading = false;
  error: string | null = null;
  hidePassword = true;
  showDemoCredentials = true;

  // Demo credentials
  private demoCredentials = {
    admin: {
      email: 'admin@textile.com',
      password: 'admin123'
    },
    user: {
      email: 'user@textile.com',
      password: 'user123'
    }
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    // Load remembered credentials if any
    this.loadRememberedCredentials();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Clear error when form changes
    this.loginForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.error) {
          this.error = null;
        }
      });
  }

  private loadRememberedCredentials(): void {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    try {
      this.loading = true;
      this.error = null;

      const { email, password, rememberMe } = this.loginForm.value;

      // Attempt login
      const loginResult = await this.authService.login(email, password).toPromise();

      if (loginResult) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Show success message
        this.snackBar.open('Connexion réussie !', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.handleLoginError(error);
    } finally {
      this.loading = false;
    }
  }

  fillDemoCredentials(type: 'admin' | 'user'): void {
    const credentials = this.demoCredentials[type];
    this.loginForm.patchValue({
      email: credentials.email,
      password: credentials.password,
      rememberMe: false
    });

    this.snackBar.open(`Identifiants ${type === 'admin' ? 'administrateur' : 'utilisateur'} remplis`, 'Fermer', {
      duration: 2000
    });
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    const dialogRef = this.dialog.open(ForgotPasswordComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Si votre email est dans notre système, vous recevrez un lien de réinitialisation.', 'Fermer', {
          duration: 5000
        });
      }
    });
  }

  onRegister(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/register']);
  }

  onPrivacyPolicy(event: Event): void {
    event.preventDefault();

    this.snackBar.open('Politique de confidentialité en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  onTermsOfService(event: Event): void {
    event.preventDefault();

    this.snackBar.open('Conditions d\'utilisation en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private handleLoginError(error: any): void {
    console.error('Login error:', error);

    let errorMessage = 'Erreur de connexion';

    if (error?.status === 401) {
      errorMessage = 'Email ou mot de passe incorrect';
    } else if (error?.status === 403) {
      errorMessage = 'Compte désactivé ou accès refusé';
    } else if (error?.status === 429) {
      errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard';
    } else if (error?.status === 0) {
      errorMessage = 'Impossible de contacter le serveur';
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    this.error = errorMessage;

    // Also show in snackbar for better UX
    this.snackBar.open(errorMessage, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Getters for template
  get isFormValid(): boolean {
    return this.loginForm.valid;
  }

  get emailError(): string | null {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.errors && emailControl.touched) {
      if (emailControl.errors['required']) {
        return 'L\'email est obligatoire';
      }
      if (emailControl.errors['email']) {
        return 'Format d\'email invalide';
      }
    }
    return null;
  }

  get passwordError(): string | null {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.errors && passwordControl.touched) {
      if (passwordControl.errors['required']) {
        return 'Le mot de passe est obligatoire';
      }
      if (passwordControl.errors['minlength']) {
        return 'Le mot de passe doit contenir au moins 6 caractères';
      }
    }
    return null;
  }
}
