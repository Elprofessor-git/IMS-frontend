import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { SelectionModel } from '@angular/cdk/collections';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  statut: string;
  derniereConnexion?: Date;
  dateCreation: Date;
}

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {
  dataSource = new MatTableDataSource<User>([]);
  loading = false;
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';
  selectedDepartment = '';
  
  // Table configuration
  displayedColumns = ['select', 'user', 'role', 'department', 'status', 'lastLogin', 'created', 'actions'];
  selection = new SelectionModel<User>(true, []);
  
  // Pagination
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;
  
  // Statistics
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    onlineUsers: 0,
    adminUsers: 0
  };
  
  // Column configuration
  availableColumns = [
    { key: 'select', label: 'Sélection', visible: true },
    { key: 'user', label: 'Utilisateur', visible: true },
    { key: 'role', label: 'Rôle', visible: true },
    { key: 'department', label: 'Département', visible: true },
    { key: 'status', label: 'Statut', visible: true },
    { key: 'lastLogin', label: 'Dernière connexion', visible: true },
    { key: 'created', label: 'Créé le', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: 1,
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@example.com',
          role: 'ADMIN',
          statut: 'ACTIF',
          derniereConnexion: new Date(),
          dateCreation: new Date()
        },
        {
          id: 2,
          nom: 'Martin',
          prenom: 'Marie',
          email: 'marie.martin@example.com',
          role: 'MANAGER',
          statut: 'ACTIF',
          derniereConnexion: new Date(Date.now() - 86400000),
          dateCreation: new Date()
        }
      ];
      this.dataSource.data = mockUsers;
      this.loading = false;
    }, 1000);
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'MANAGER': return 'Manager';
      case 'USER': return 'Utilisateur';
      default: return role;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIF': return 'Actif';
      case 'INACTIF': return 'Inactif';
      case 'SUSPENDU': return 'Suspendu';
      default: return status;
    }
  }

  viewUser(user: User): void {
    console.log('Affichage des détails de', user.prenom, user.nom);
  }

  // Template methods
  openUserForm(user?: User): void {
    console.log('Ouverture du formulaire utilisateur', user);
  }

  exportUsers(): void {
    console.log('Export des utilisateurs');
  }

  importUsers(): void {
    console.log('Import des utilisateurs');
  }

  onSearch(): void {
    console.log('Recherche:', this.searchTerm);
    this.applyFilters();
  }

  onFilterChange(): void {
    console.log('Changement de filtre');
    this.applyFilters();
  }

  private applyFilters(): void {
    // Apply search and filters logic here
    this.loadUsers();
  }

  // Table selection methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: User): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // User actions
  editUser(user: User): void {
    console.log('Édition utilisateur:', user);
    this.openUserForm(user);
  }

  deleteUser(user: User): void {
    console.log('Suppression utilisateur:', user);
  }

  toggleUserStatus(user: User): void {
    console.log('Changement statut utilisateur:', user);
    user.statut = user.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
  }

  resetPassword(user: User): void {
    console.log('Réinitialisation mot de passe:', user);
  }

  // Bulk actions
  activateSelected(): void {
    console.log('Activation utilisateurs sélectionnés:', this.selection.selected);
  }

  deactivateSelected(): void {
    console.log('Désactivation utilisateurs sélectionnés:', this.selection.selected);
  }

  exportSelected(): void {
    console.log('Export utilisateurs sélectionnés:', this.selection.selected);
  }

  deleteSelected(): void {
    console.log('Suppression utilisateurs sélectionnés:', this.selection.selected);
  }

  // Utility methods
  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'warn';
      case 'MANAGER': return 'accent';
      case 'USER': return 'primary';
      default: return '';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIF': return 'primary';
      case 'INACTIF': return 'warn';
      case 'SUSPENDU': return 'accent';
      default: return '';
    }
  }

  // Column visibility
  toggleColumn(column: any): void {
    column.visible = !column.visible;
    this.updateDisplayedColumns();
  }

  updateDisplayedColumns(): void {
    this.displayedColumns = this.availableColumns
      .filter(col => col.visible)
      .map(col => col.key);
  }

  // Pagination
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  // Additional missing methods
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.selectedDepartment = '';
    this.applyFilters();
  }

  refreshData(): void {
    this.loadUsers();
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'ADMIN': return 'admin_panel_settings';
      case 'MANAGER': return 'supervisor_account';
      case 'USER': return 'person';
      default: return 'person';
    }
  }

  getDepartmentIcon(department: string): string {
    switch (department) {
      case 'IT': return 'computer';
      case 'RH': return 'people';
      case 'PRODUCTION': return 'precision_manufacturing';
      case 'VENTE': return 'storefront';
      default: return 'business';
    }
  }

  getDepartmentLabel(department: string): string {
    switch (department) {
      case 'IT': return 'Informatique';
      case 'RH': return 'Ressources Humaines';
      case 'PRODUCTION': return 'Production';
      case 'VENTE': return 'Vente';
      default: return department;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIF': return 'check_circle';
      case 'INACTIF': return 'cancel';
      case 'SUSPENDU': return 'pause_circle';
      default: return 'help';
    }
  }

  changeRole(user: User): void {
    console.log('Changement de rôle:', user);
  }

  viewUserActivity(user: User): void {
    console.log('Activité utilisateur:', user);
  }

  viewUserPermissions(user: User): void {
    console.log('Permissions utilisateur:', user);
  }

  bulkActivate(): void {
    console.log('Activation en lot');
    this.activateSelected();
  }

  bulkDeactivate(): void {
    console.log('Désactivation en lot');
    this.deactivateSelected();
  }

  bulkExport(): void {
    console.log('Export en lot');
    this.exportSelected();
  }

  bulkDelete(): void {
    console.log('Suppression en lot');
    this.deleteSelected();
  }
}
