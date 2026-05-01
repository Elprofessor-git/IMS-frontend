import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { SelectionModel } from '@angular/cdk/collections';
import { UtilisateurService, Role } from './utilisateur.service';
import { NotificationService } from '../../core/services/notification.service';

// Extended Role interface to match what the HTML expects
export interface RoleViewModel extends Role {
  nom: string;
  permissions: any[];
  utilisateurs: { prenom: string; nom: string; avatar?: string }[];
  actif: boolean;
  dateCreation: Date | string;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDividerModule
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: TemplateRef<any>;

  // Data
  roles: RoleViewModel[] = [];
  filteredRoles: RoleViewModel[] = [];
  dataSource = new MatTableDataSource<RoleViewModel>([]);
  loading = false;
  
  // Stats
  totalRoles = 0;
  activeRoles = 0;
  totalUsers = 0;
  totalPermissions = 0;

  // Filters
  searchTerm = '';
  statusFilter = '';
  levelFilter = '';

  // Table Config
  selection = new SelectionModel<RoleViewModel>(true, []);
  availableColumns = [
    { key: 'select', label: 'Sélection' },
    { key: 'nom', label: 'Nom' },
    { key: 'niveau', label: 'Niveau' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'utilisateurs', label: 'Utilisateurs' },
    { key: 'statut', label: 'Statut' },
    { key: 'dateCreation', label: 'Date de Création' },
    { key: 'actions', label: 'Actions' }
  ];
  displayedColumns = this.availableColumns.map(c => c.key);
  
  roleToDelete: RoleViewModel | null = null;

  constructor(
    private utilisateurService: UtilisateurService,
    private router: Router,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadRoles(): void {
    this.loading = true;
    this.utilisateurService.getRoles().subscribe({
      next: (apiRoles) => {
        console.log('API Roles received:', apiRoles);
        
        // Handle case where API might return an object with a roles property
        const rolesList = Array.isArray(apiRoles) ? apiRoles : (apiRoles as any).roles || (apiRoles as any).data || [];
        
        // Map API roles to view model
        this.roles = rolesList.map((role: any) => ({
          ...role,
          nom: role.name || role.nom || 'Sans nom',
          permissions: role.permissions || [],
          utilisateurs: role.utilisateurs || [],
          actif: role.actif !== undefined ? role.actif : true,
          dateCreation: role.dateCreation || new Date()
        }));
        
        console.log('Mapped Roles:', this.roles);
        
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.notificationService.error('Erreur lors du chargement des rôles');
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalRoles = this.roles.length;
    this.activeRoles = this.roles.filter(r => r.actif).length;
    // Mock counts since actual users/permissions per role requires extra API calls
    this.totalUsers = this.roles.reduce((sum, r) => sum + (r.utilisateurs?.length || 0), 0);
    this.totalPermissions = 25; // Dummy number
  }

  // --- Filtering ---
  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.levelFilter = '';
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredRoles = this.roles.filter(role => {
      const matchSearch = !this.searchTerm || 
        role.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        (role.description && role.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchStatus = !this.statusFilter || 
        (this.statusFilter === 'actif' && role.actif) || 
        (this.statusFilter === 'inactif' && !role.actif);
        
      const matchLevel = !this.levelFilter || role.niveau?.toString() === this.levelFilter;
      
      return matchSearch && matchStatus && matchLevel;
    });

    this.dataSource.data = this.filteredRoles;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  refreshRoles(): void {
    this.loadRoles();
  }

  // --- Table Interaction ---
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  toggleColumn(column: any): void {
    const index = this.displayedColumns.indexOf(column.key);
    if (index > -1) {
      this.displayedColumns.splice(index, 1);
    } else {
      // Find original position to maintain order
      const originalIndex = this.availableColumns.findIndex(c => c.key === column.key);
      this.displayedColumns.splice(originalIndex, 0, column.key);
    }
  }

  getLevelIcon(level: number | undefined): string {
    switch (level) {
      case 1: return 'security';
      case 2: return 'supervisor_account';
      case 3: return 'manage_accounts';
      case 4: return 'person';
      default: return 'help_outline';
    }
  }

  // --- Actions ---
  createRole(): void {
    this.router.navigate(['/utilisateurs/roles/nouveau']);
  }

  viewRole(role: RoleViewModel): void {
    // Navigate to role details or open a dialog
    this.router.navigate(['/utilisateurs/roles', role.id]);
  }

  editRole(role: RoleViewModel): void {
    this.router.navigate(['/utilisateurs/roles', role.id]);
  }

  duplicateRole(role: RoleViewModel): void {
    // Implement duplicate logic
    this.notificationService.success(`Rôle ${role.nom} dupliqué`);
  }

  toggleRoleStatus(role: RoleViewModel): void {
    role.actif = !role.actif;
    this.notificationService.success(`Le rôle ${role.nom} a été ${role.actif ? 'activé' : 'désactivé'}.`);
  }

  assignUsers(role: RoleViewModel): void {
    // Open user assignment dialog
  }

  deleteRole(role: RoleViewModel): void {
    this.roleToDelete = role;
    this.dialog.open(this.deleteConfirmDialog, { width: '400px' });
  }

  confirmDelete(): void {
    if (this.roleToDelete) {
      this.loading = true;
      this.utilisateurService.deleteRole(this.roleToDelete.id).subscribe({
        next: () => {
          this.notificationService.success('Rôle supprimé avec succès');
          this.dialog.closeAll();
          this.loadRoles();
        },
        error: (err) => {
          console.error('Error deleting role', err);
          this.notificationService.error('Erreur lors de la suppression');
          this.loading = false;
        }
      });
    }
  }

  exportRoles(): void {
    // Implement export functionality
    this.notificationService.success('Exportation démarrée');
  }

  // --- Bulk Actions ---
  bulkActivate(): void {
    this.selection.selected.forEach(role => role.actif = true);
    this.selection.clear();
    this.notificationService.success('Rôles activés avec succès');
  }

  bulkDeactivate(): void {
    this.selection.selected.forEach(role => role.actif = false);
    this.selection.clear();
    this.notificationService.success('Rôles désactivés avec succès');
  }

  bulkDelete(): void {
    // In a real app, you would call a bulk delete endpoint
    this.notificationService.info('Fonctionnalité de suppression en masse en cours de développement');
  }
}
