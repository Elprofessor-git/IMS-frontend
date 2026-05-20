import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { CustomRoleService, CustomRole } from './custom-role.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="roles-container">

      <!-- En-tête -->
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>security</mat-icon>
            Rôles &amp; Permissions
          </mat-card-title>
          <mat-card-subtitle>Gérez les rôles personnalisés et leurs droits d'accès</mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="toggleForm()">
            <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
            {{ showForm ? 'Annuler' : 'Créer un rôle' }}
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Formulaire création -->
      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header>
          <mat-card-title>Nouveau rôle</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="roleForm" class="role-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom du rôle</mat-label>
              <input matInput formControlName="nom" placeholder="Ex: Responsable Stock">
              <mat-error *ngIf="roleForm.get('nom')?.hasError('required')">Nom requis</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <input matInput formControlName="description" placeholder="Description optionnelle">
            </mat-form-field>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-button (click)="toggleForm()">Annuler</button>
          <button mat-raised-button color="primary"
                  [disabled]="roleForm.invalid || isSaving"
                  (click)="creerRole()">
            <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
            <span *ngIf="!isSaving">Créer</span>
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Chargement -->
      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Tableau des rôles -->
      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="roles" class="roles-table">

            <ng-container matColumnDef="nom">
              <th mat-header-cell *matHeaderCellDef>Nom du rôle</th>
              <td mat-cell *matCellDef="let r">
                <div class="role-name-cell">
                  <mat-icon [class.system-icon]="r.estSysteme">
                    {{ r.estSysteme ? 'shield' : 'security' }}
                  </mat-icon>
                  <strong>{{ r.nom }}</strong>
                  <mat-chip *ngIf="r.estSysteme" color="primary" selected class="system-chip">
                    Système
                  </mat-chip>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let r">
                <span class="desc-text">{{ r.description || '—' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="nbUtilisateurs">
              <th mat-header-cell *matHeaderCellDef>Utilisateurs</th>
              <td mat-cell *matCellDef="let r">
                <mat-chip>{{ r.nbUtilisateurs ?? 0 }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let r">
                <div class="action-btns">
                  <button mat-icon-button color="primary"
                          (click)="voirPermissions(r)"
                          matTooltip="Gérer les permissions">
                    <mat-icon>tune</mat-icon>
                  </button>
                  <button mat-icon-button color="accent"
                          [disabled]="r.estSysteme"
                          (click)="modifierRole(r)"
                          matTooltip="{{ r.estSysteme ? 'Rôle système non modifiable' : 'Modifier' }}">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn"
                          [disabled]="r.estSysteme || (r.nbUtilisateurs ?? 0) > 0"
                          (click)="supprimerRole(r)"
                          matTooltip="{{ r.estSysteme ? 'Rôle système protégé' : (r.nbUtilisateurs ?? 0) > 0 ? 'Des utilisateurs sont affectés à ce rôle' : 'Supprimer' }}">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="colonnes"></tr>
            <tr mat-row *matRowDef="let row; columns: colonnes;"></tr>
          </table>

          <div *ngIf="roles.length === 0" class="empty-state">
            <mat-icon>security</mat-icon>
            <p>Aucun rôle défini. Créez le premier rôle !</p>
          </div>
        </mat-card-content>
      </mat-card>

    </div>

    <!-- Dialog modification inline -->
    <mat-card *ngIf="roleEnEdition" class="edit-card">
      <mat-card-header>
        <mat-card-title>Modifier : {{ roleEnEdition.nom }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="editForm" class="role-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description">
          </mat-form-field>
        </form>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button (click)="annulerEdition()">Annuler</button>
        <button mat-raised-button color="primary"
                [disabled]="editForm.invalid || isSaving"
                (click)="sauvegarderEdition()">
          <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
          <span *ngIf="!isSaving">Sauvegarder</span>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .roles-container { max-width: 900px; margin: 20px auto; padding: 0 16px; display: flex; flex-direction: column; gap: 16px; }
    .header-card mat-card-title { display: flex; align-items: center; gap: 8px; color: #1976d2; }
    .full-width { width: 100%; margin-bottom: 10px; }
    .role-form { padding: 4px 0; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .roles-table { width: 100%; }
    .role-name-cell { display: flex; align-items: center; gap: 8px; }
    .system-icon { color: #1976d2; }
    .system-chip { font-size: 0.7rem; height: 20px; }
    .desc-text { color: #666; font-size: 0.875rem; }
    .action-btns { display: flex; gap: 4px; }
    .empty-state { text-align: center; padding: 40px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; }
    .edit-card { max-width: 900px; margin: 0 auto 16px; padding: 0 16px; }
  `]
})
export class RolesComponent implements OnInit {
  roles: CustomRole[] = [];
  loading = false;
  isSaving = false;
  showForm = false;
  roleEnEdition: CustomRole | null = null;
  colonnes = ['nom', 'description', 'nbUtilisateurs', 'actions'];

  roleForm: FormGroup;
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customRoleService: CustomRoleService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['']
    });
    this.editForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.chargerRoles();
  }

  chargerRoles(): void {
    this.loading = true;
    this.customRoleService.getAll().subscribe({
      next: (data) => { this.roles = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.roleForm.reset();
  }

  creerRole(): void {
    if (this.roleForm.invalid) return;
    this.isSaving = true;
    this.customRoleService.create(this.roleForm.value).subscribe({
      next: () => {
        this.snackBar.open('Rôle créé avec succès', 'OK', { duration: 3000 });
        this.isSaving = false;
        this.toggleForm();
        this.chargerRoles();
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erreur', 'Fermer', { duration: 5000 });
        this.isSaving = false;
      }
    });
  }

  modifierRole(role: CustomRole): void {
    this.roleEnEdition = role;
    this.editForm.patchValue({ nom: role.nom, description: role.description || '' });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  annulerEdition(): void {
    this.roleEnEdition = null;
    this.editForm.reset();
  }

  sauvegarderEdition(): void {
    if (!this.roleEnEdition || this.editForm.invalid) return;
    this.isSaving = true;
    this.customRoleService.update(this.roleEnEdition.id, this.editForm.value).subscribe({
      next: () => {
        this.snackBar.open('Rôle modifié', 'OK', { duration: 3000 });
        this.isSaving = false;
        this.annulerEdition();
        this.chargerRoles();
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erreur', 'Fermer', { duration: 5000 });
        this.isSaving = false;
      }
    });
  }

  voirPermissions(role: CustomRole): void {
    this.router.navigate(['/utilisateurs/roles', role.id, 'permissions']);
  }

  supprimerRole(role: CustomRole): void {
    if (!confirm(`Supprimer le rôle "${role.nom}" ?`)) return;
    this.customRoleService.delete(role.id).subscribe({
      next: () => {
        this.snackBar.open('Rôle supprimé', 'OK', { duration: 3000 });
        this.chargerRoles();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Erreur', 'Fermer', { duration: 5000 })
    });
  }
}
