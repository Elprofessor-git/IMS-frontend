import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { UtilisateurService, Role } from './utilisateur.service';
import { NotificationService } from '../../core/services/notification.service';

interface Permission {
  code: string;
  nom: string;
  description: string;
  niveau: number;
  categorie: string;
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatCheckboxModule,
    MatExpansionModule
  ],
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss']
})
export class RoleFormComponent implements OnInit {
  roleForm!: FormGroup;
  isEditMode = false;
  roleId: string | null = null;
  loading = false;
  permissionFilter = '';
  assignedUsers: any[] = [];

  // Mock permissions available in the system
  allPermissions: Permission[] = [
    { code: 'users_read', nom: 'Voir les utilisateurs', description: 'Consulter la liste des utilisateurs', niveau: 4, categorie: 'users' },
    { code: 'users_write', nom: 'Gérer les utilisateurs', description: 'Créer et modifier des utilisateurs', niveau: 2, categorie: 'users' },
    { code: 'stock_read', nom: 'Voir le stock', description: 'Consulter l\'état du stock', niveau: 4, categorie: 'stock' },
    { code: 'stock_write', nom: 'Gérer le stock', description: 'Ajouter ou modifier des articles', niveau: 3, categorie: 'stock' },
    { code: 'orders_read', nom: 'Voir les commandes', description: 'Consulter les commandes', niveau: 4, categorie: 'orders' },
    { code: 'orders_write', nom: 'Gérer les commandes', description: 'Créer et valider des commandes', niveau: 2, categorie: 'orders' },
    { code: 'production_read', nom: 'Voir la production', description: 'Suivre la production', niveau: 4, categorie: 'production' },
    { code: 'production_write', nom: 'Gérer la production', description: 'Planifier la production', niveau: 2, categorie: 'production' },
    { code: 'reports_read', nom: 'Voir les rapports', description: 'Consulter les statistiques', niveau: 3, categorie: 'reports' },
    { code: 'admin_all', nom: 'Administration globale', description: 'Accès complet au système', niveau: 1, categorie: 'admin' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    const formControls: any = {
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      niveau: ['4'],
      couleur: ['#1976d2'],
      actif: [true]
    };

    // Add a control for each permission dynamically
    this.allPermissions.forEach(p => {
      formControls['permission_' + p.code] = [false];
    });

    this.roleForm = this.fb.group(formControls);
  }

  private checkEditMode(): void {
    this.route.paramMap.subscribe(params => {
      this.roleId = params.get('id');
      if (this.roleId) {
        this.isEditMode = true;
        this.loadRole(this.roleId);
      }
    });
  }

  private loadRole(id: string): void {
    this.loading = true;
    // Mock fetching a role
    setTimeout(() => {
      // Dummy data that matches expected structure
      const mockRole = {
        nom: 'Manager',
        description: 'Rôle pour les managers',
        niveau: '2',
        couleur: '#388e3c',
        actif: true,
        permissions: ['users_read', 'stock_read', 'stock_write', 'orders_read']
      };

      this.roleForm.patchValue({
        nom: mockRole.nom,
        description: mockRole.description,
        niveau: mockRole.niveau,
        couleur: mockRole.couleur,
        actif: mockRole.actif
      });

      // Patch permissions
      mockRole.permissions.forEach(code => {
        if (this.roleForm.contains('permission_' + code)) {
          this.roleForm.get('permission_' + code)?.setValue(true);
        }
      });

      this.assignedUsers = [
        { prenom: 'John', nom: 'Doe', email: 'john@example.com', actif: true },
        { prenom: 'Jane', nom: 'Smith', email: 'jane@example.com', actif: false }
      ];

      this.loading = false;
    }, 500);
  }

  // --- Permissions Logic ---
  getFilteredPermissions(category: string): Permission[] {
    return this.allPermissions.filter(p => 
      p.categorie === category && 
      (!this.permissionFilter || p.nom.toLowerCase().includes(this.permissionFilter.toLowerCase()))
    );
  }

  getPermissionCount(category: string): number {
    return this.allPermissions.filter(p => p.categorie === category).length;
  }

  getSelectedPermissions(): Permission[] {
    return this.allPermissions.filter(p => this.roleForm.get('permission_' + p.code)?.value);
  }

  getSelectedPermissionsCount(): number {
    return this.getSelectedPermissions().length;
  }

  selectAllPermissions(): void {
    this.allPermissions.forEach(p => {
      this.roleForm.get('permission_' + p.code)?.setValue(true);
    });
  }

  deselectAllPermissions(): void {
    this.allPermissions.forEach(p => {
      this.roleForm.get('permission_' + p.code)?.setValue(false);
    });
  }

  removePermission(permission: Permission): void {
    this.roleForm.get('permission_' + permission.code)?.setValue(false);
  }

  // --- Form Status ---
  getFormStatus(): string {
    if (this.roleForm.valid) return 'valid';
    if (this.roleForm.pending) return 'pending';
    return 'invalid';
  }

  getFormStatusIcon(): string {
    if (this.roleForm.valid) return 'check_circle';
    if (this.roleForm.pending) return 'hourglass_empty';
    return 'error';
  }

  getFormStatusText(): string {
    if (this.roleForm.valid) return 'Prêt à sauvegarder';
    if (this.roleForm.pending) return 'Validation en cours...';
    if (this.roleForm.dirty && this.roleForm.invalid) return 'Veuillez corriger les erreurs';
    return 'Formulaire invalide';
  }

  // --- Actions ---
  onCancel(): void {
    this.router.navigate(['/utilisateurs/roles']);
  }

  previewRole(): void {
    this.notificationService.info('Aperçu du rôle non implémenté');
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.roleForm.value;
    
    // Mapping pour le Backend (CreateRoleDto/RoleDto)
    const roleData: any = {
      name: formValue.nom,
      description: formValue.description,
      peutGererStock: formValue['permission_stock_write'] || false,
      estAdministrateur: formValue.niveau === '1' || formValue['permission_admin_all'] || false
    };

    const action = this.isEditMode && this.roleId
      ? this.utilisateurService.updateRole(this.roleId, roleData)
      : this.utilisateurService.createRole(roleData);

    action.subscribe({
      next: () => {
        this.loading = false;
        this.notificationService.success(`Rôle ${this.isEditMode ? 'mis à jour' : 'créé'} avec succès`);
        this.router.navigate(['/utilisateurs/roles']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors de la sauvegarde du rôle:', error);
        this.notificationService.error('Erreur lors de la sauvegarde du rôle');
      }
    });
  }
}
