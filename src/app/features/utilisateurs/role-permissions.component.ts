import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CustomRoleService, CustomRole, RolePermission, MODULES } from './custom-role.service';

interface PermissionRow {
  module: string;
  label: string;
  canAccess: boolean;
  canWrite: boolean;
}

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Tableau de bord',
  articles: 'Articles',
  stock: 'Stock',
  mouvements: 'Mouvements',
  achats: 'Achats',
  importations: 'Importations',
  commandes: 'Commandes / OF',
  clients: 'Clients',
  fournisseurs: 'Fournisseurs',
  taches: 'Tâches de production',
  utilisateurs: 'Utilisateurs',
  roles: 'Rôles & Permissions',
  chatbot: 'Chatbot IA',
  rapports: 'Rapports & Analytics'
};

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="perms-container">

      <!-- Chargement -->
      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading">

        <!-- En-tête -->
        <mat-card class="header-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>tune</mat-icon>
              Permissions — {{ role?.nom }}
            </mat-card-title>
            <mat-card-subtitle *ngIf="role?.estSysteme">
              <mat-icon color="primary">shield</mat-icon>
              Rôle système — accès total permanent, non modifiable
            </mat-card-subtitle>
            <mat-card-subtitle *ngIf="!role?.estSysteme">
              Définissez les droits d'accès pour chaque module
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button (click)="retour()">
              <mat-icon>arrow_back</mat-icon> Retour
            </button>
            <button mat-raised-button color="primary"
                    [disabled]="role?.estSysteme || isSaving"
                    (click)="sauvegarder()">
              <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
              <mat-icon *ngIf="!isSaving">save</mat-icon>
              <span *ngIf="!isSaving">Sauvegarder</span>
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Légende -->
        <div class="legende">
          <span class="legende-item"><span class="dot green"></span> Accès activé</span>
          <span class="legende-item"><span class="dot grey"></span> Accès désactivé</span>
          <span class="legende-item"><mat-icon class="small-icon">edit</mat-icon> Lecture+Écriture</span>
          <span class="legende-item"><mat-icon class="small-icon">visibility</mat-icon> Lecture seule</span>
        </div>

        <!-- Matrice -->
        <mat-card class="matrix-card">
          <mat-card-content>
            <div class="matrix-header">
              <span class="col-module">Module</span>
              <span class="col-access">Accès</span>
              <span class="col-mode">Mode</span>
            </div>
            <mat-divider></mat-divider>

            <div *ngFor="let row of permissions; let i = index" class="matrix-row"
                 [class.disabled-row]="!row.canAccess">
              <span class="col-module">
                <mat-icon class="module-icon">{{ getModuleIcon(row.module) }}</mat-icon>
                {{ row.label }}
              </span>

              <span class="col-access">
                <mat-slide-toggle
                  [(ngModel)]="row.canAccess"
                  [disabled]="role?.estSysteme || false"
                  (change)="onAccessChange(row)"
                  color="primary">
                </mat-slide-toggle>
              </span>

              <span class="col-mode">
                <mat-radio-group
                  [(ngModel)]="row.canWrite"
                  [disabled]="!row.canAccess || role?.estSysteme || false"
                  class="mode-group">
                  <mat-radio-button [value]="false" color="primary">
                    <mat-icon class="radio-icon">visibility</mat-icon>
                    Lecture seule
                  </mat-radio-button>
                  <mat-radio-button [value]="true" color="primary">
                    <mat-icon class="radio-icon">edit</mat-icon>
                    Lecture+Écriture
                  </mat-radio-button>
                </mat-radio-group>
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Actions rapides -->
        <div class="quick-actions" *ngIf="!role?.estSysteme">
          <button mat-stroked-button (click)="toutActiver()">
            <mat-icon>check_circle</mat-icon> Tout activer
          </button>
          <button mat-stroked-button (click)="toutDesactiver()">
            <mat-icon>cancel</mat-icon> Tout désactiver
          </button>
          <button mat-stroked-button color="primary" (click)="toutLectureEcriture()">
            <mat-icon>edit</mat-icon> Tout Lecture+Écriture
          </button>
          <button mat-stroked-button (click)="toutLectureSeule()">
            <mat-icon>visibility</mat-icon> Tout Lecture seule
          </button>
        </div>

      </ng-container>
    </div>
  `,
  styles: [`
    .perms-container { max-width: 860px; margin: 20px auto; padding: 0 16px; display: flex; flex-direction: column; gap: 16px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .header-card mat-card-title { display: flex; align-items: center; gap: 8px; color: #1976d2; }
    .header-card mat-card-subtitle { display: flex; align-items: center; gap: 4px; margin-top: 4px; }

    .legende { display: flex; gap: 20px; align-items: center; font-size: 0.82rem; color: #666; flex-wrap: wrap; }
    .legende-item { display: flex; align-items: center; gap: 4px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot.green { background: #4caf50; }
    .dot.grey { background: #bdbdbd; }
    .small-icon { font-size: 14px; height: 14px; width: 14px; color: #1976d2; }

    .matrix-header { display: flex; align-items: center; padding: 8px 12px; background: #f5f5f5; font-weight: 600; font-size: 0.85rem; color: #555; border-radius: 4px; margin-bottom: 4px; }
    .matrix-row { display: flex; align-items: center; padding: 10px 12px; border-bottom: 1px solid #f0f0f0; transition: background 0.15s; }
    .matrix-row:hover { background: #fafafa; }
    .matrix-row:last-child { border-bottom: none; }
    .disabled-row { opacity: 0.5; }

    .col-module { flex: 2; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
    .col-access { flex: 0 0 90px; }
    .col-mode { flex: 3; }
    .module-icon { font-size: 18px; height: 18px; width: 18px; color: #1976d2; }

    .mode-group { display: flex; gap: 16px; flex-wrap: wrap; }
    .radio-icon { font-size: 14px; height: 14px; width: 14px; vertical-align: middle; margin-right: 2px; }

    .quick-actions { display: flex; gap: 10px; flex-wrap: wrap; padding: 4px 0; }

    @media (max-width: 640px) {
      .matrix-header, .matrix-row { flex-wrap: wrap; gap: 8px; }
      .col-module { flex: 1 0 100%; }
      .col-mode { flex: 1 0 100%; }
    }
  `]
})
export class RolePermissionsComponent implements OnInit {
  roleId!: string;
  role: CustomRole | null = null;
  permissions: PermissionRow[] = [];
  loading = false;
  isSaving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customRoleService: CustomRoleService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id')!;
    this.charger();
  }

  private charger(): void {
    this.loading = true;
    this.customRoleService.getById(this.roleId).subscribe({
      next: (role) => {
        this.role = role;
        this.customRoleService.getPermissions(this.roleId).subscribe({
          next: (perms) => {
            this.permissions = MODULES.map(mod => {
              const existing = perms.find(p => p.module === mod);
              return {
                module: mod,
                label: MODULE_LABELS[mod] || mod,
                canAccess: existing?.canAccess ?? false,
                canWrite: existing?.canWrite ?? false
              };
            });
            this.loading = false;
          },
          error: () => {
            this.permissions = MODULES.map(mod => ({
              module: mod,
              label: MODULE_LABELS[mod] || mod,
              canAccess: false,
              canWrite: false
            }));
            this.loading = false;
          }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  onAccessChange(row: PermissionRow): void {
    if (!row.canAccess) row.canWrite = false;
  }

  sauvegarder(): void {
    this.isSaving = true;
    const payload: RolePermission[] = this.permissions.map(p => ({
      module: p.module,
      canAccess: p.canAccess,
      canWrite: p.canWrite
    }));

    this.customRoleService.savePermissions(this.roleId, payload).subscribe({
      next: () => {
        this.snackBar.open('Permissions sauvegardées', 'OK', { duration: 3000 });
        this.isSaving = false;
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erreur', 'Fermer', { duration: 5000 });
        this.isSaving = false;
      }
    });
  }

  toutActiver(): void { this.permissions.forEach(p => p.canAccess = true); }
  toutDesactiver(): void { this.permissions.forEach(p => { p.canAccess = false; p.canWrite = false; }); }
  toutLectureEcriture(): void { this.permissions.forEach(p => { if (p.canAccess) p.canWrite = true; }); }
  toutLectureSeule(): void { this.permissions.forEach(p => p.canWrite = false); }

  getModuleIcon(module: string): string {
    const icons: Record<string, string> = {
      dashboard: 'dashboard', articles: 'category', stock: 'storage',
      mouvements: 'swap_horiz', achats: 'shopping_bag', importations: 'flight_land',
      commandes: 'shopping_cart', clients: 'person', fournisseurs: 'business',
      taches: 'task', utilisateurs: 'manage_accounts', roles: 'security',
      chatbot: 'smart_toy', rapports: 'analytics'
    };
    return icons[module] || 'circle';
  }

  retour(): void { this.router.navigate(['/utilisateurs/roles']); }
}
