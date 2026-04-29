import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { UtilisateurService, User, Role } from './utilisateur.service';
import { NotificationService } from '../../core/services/notification.service';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-utilisateur-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule
  ],
  templateUrl: './utilisateur-form.component.html',
  styleUrls: ['./utilisateur-form.component.scss']
})
export class UtilisateurFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService,
    private notificationService: NotificationService
  ) {}

  utilisateurForm!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  availableRoles: Role[] = [];
  availableManagers: User[] = []; // Assuming a User[] type for managers
  currentUser: User | null = null;
  selectedAvatar: string | ArrayBuffer | null = null;
  
  // Permissions and dates
  canEditSalary = false; // This should be based on user roles/permissions
  today = new Date();
  maxBirthDate = new Date(this.today.getFullYear() - 18, this.today.getMonth(), this.today.getDate());

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
    this.loadManagers();
    this.checkEditMode();
  }

  private initForm(): void {
    this.utilisateurForm = this.fb.group({
      // Informations personnelles
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$')]],
      dateNaissance: [null],
      genre: ['N'],

      // Informations professionnelles
      poste: [''],
      departement: [''],
      managerId: [null],
      dateEmbauche: [null],
      salaire: [null, [Validators.min(0)]],
      typeContrat: [''],

      // Compte et sécurité
      nomUtilisateur: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.-]*$')]],
      motDePasse: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$')]],
      confirmerMotDePasse: ['', [Validators.required]],
      roleId: [[], Validators.required],
      forceChangePassword: [false],
      activerNotifications: [true],
      activerDoubleAuthentification: [false],

      // Adresse
      adresse: [''],
      codePostal: [''],
      ville: [''],
      pays: ['FR'],

      // Notes
      notes: [''],

      // Statut
      actif: [true]
    }, { validators: this.passwordMatchValidator });
  }

  private loadManagers(): void {
    this.utilisateurService.getUsers().subscribe(users => {
      // In edit mode, filter out the current user from their own manager list
      if (this.isEditMode && this.userId) {
        this.availableManagers = users.filter(u => u.id !== this.userId);
      } else {
        this.availableManagers = users;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('motDePasse')?.value;
    const confirmPassword = form.get('confirmerMotDePasse')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private loadRoles(): void {
    this.utilisateurService.getRoles().subscribe(roles => {
      this.availableRoles = roles;
    });
  }

  private checkEditMode(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.userId = params.get('id');
        if (this.userId) {
          this.isEditMode = true;
          this.loading = true;
          // Password is not required in edit mode unless being changed
          this.utilisateurForm.get('motDePasse')?.clearValidators();
          this.utilisateurForm.get('confirmerMotDePasse')?.clearValidators();
          this.utilisateurForm.updateValueAndValidity();
          return this.utilisateurService.getUser(this.userId);
        }
        return of(null);
      })
    ).subscribe(user => {
      if (user) {
        // Map backend user model to the form model
        // Map role names from user.roles to role IDs for the form
        const roleIds = this.availableRoles
          .filter(role => user.roles.includes(role.name))
          .map(role => role.id);

        const formValue = {
          ...user,
          nomUtilisateur: user.userName,
          roleId: roleIds,
          // Map other fields if names differ
        };
        this.currentUser = user;
        this.utilisateurForm.patchValue(formValue);
        // After patching the form, we might need to refresh the manager list
        // to ensure the current user is excluded.
        this.loadManagers(); 
      }
      this.loading = false;
    });
  }

  onSubmit(): void {
    if (this.utilisateurForm.invalid) {
      // Mark all fields as touched to display errors
      this.utilisateurForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.utilisateurForm.getRawValue();

    // Map form model to backend DTO
    const userData: any = {
      ...formValue,
      userName: formValue.nomUtilisateur,
      roles: formValue.roleId
    };

    // Do not send password if it's empty in edit mode
    if (this.isEditMode && !userData.motDePasse) {
      delete userData.motDePasse;
    }

    // Remove confirmation password before sending
    delete userData.confirmerMotDePasse;

    if (this.isEditMode) {
      this.utilisateurService.updateUser(this.userId!, userData).subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.success('Utilisateur mis à jour avec succès');
          this.router.navigate(['/utilisateurs']);
        },
        error: (err: any) => {
          this.loading = false;
          this.notificationService.error('Erreur lors de la mise à jour de l\'utilisateur');
          console.error('Erreur lors de la mise à jour', err);
        }
      });
    } else {
      this.utilisateurService.createUser(userData).subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.success('Utilisateur créé avec succès');
          this.router.navigate(['/utilisateurs']);
        },
        error: (err: any) => {
          this.loading = false;
          this.notificationService.error('Erreur lors de la création de l\'utilisateur');
          console.error('Erreur lors de la création', err);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/utilisateurs']);
  }

  // --- Avatar Methods ---
  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedAvatar = reader.result;
      };
      reader.readAsDataURL(file);
      // TODO: Implement file upload logic to the backend
    }
  }

  removeAvatar(): void {
    this.selectedAvatar = null;
    // TODO: Implement logic to remove avatar from backend
  }

  // --- Form Status Methods ---
  getFormStatus(): string {
    if (this.utilisateurForm.valid) return 'valid';
    if (this.utilisateurForm.pending) return 'pending';
    return 'invalid';
  }

  getFormStatusIcon(): string {
    if (this.utilisateurForm.valid) return 'check_circle';
    if (this.utilisateurForm.pending) return 'hourglass_empty';
    return 'error';
  }

  getFormStatusText(): string {
    if (this.utilisateurForm.valid) return 'Prêt à sauvegarder';
    if (this.utilisateurForm.pending) return 'Validation en cours...';
    if (this.utilisateurForm.dirty && this.utilisateurForm.invalid) return 'Veuillez corriger les erreurs';
    return 'Formulaire invalide';
  }

  // --- Action Methods ---
  saveAsDraft(): void {
    // TODO: Implement draft saving logic
  }
}


