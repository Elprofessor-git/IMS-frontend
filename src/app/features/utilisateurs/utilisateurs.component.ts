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
import { UtilisateurService, User } from './utilisateur.service'; // Import service and User interface

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

  // Table configuration
  displayedColumns = ['select', 'user', 'role', 'actions'];
  selection = new SelectionModel<User>(true, []);

  // Pagination
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;

  // Statistics
  stats = {
    totalUsers: 0,
    adminUsers: 0
    // activeUsers and onlineUsers removed as the new model doesn't support them yet.
  };

  // Column configuration
  availableColumns = [
    { key: 'select', label: 'Sélection', visible: true },
    { key: 'user', label: 'Utilisateur', visible: true },
    { key: 'role', label: 'Rôles', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.utilisateurService.getUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.totalItems = users.length;
        // Update stats based on real data
        this.stats.totalUsers = users.length;
        this.stats.adminUsers = users.filter(u => u.roles.includes('ADMIN')).length;
        // TODO: Add logic for active/online users if available from API
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
        this.loading = false;
        // TODO: Add user-facing error notification
      }
    });
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'MANAGER': return 'Manager';
      case 'USER': return 'Utilisateur';
      default: return role;
    }
  }


  viewUser(user: User): void {
    
  }

  // Template methods
  openUserForm(user?: User): void {
    
  }

  exportUsers(): void {
    
  }

  importUsers(): void {
    
  }

  onSearch(): void {
    
    this.applyFilters();
  }

  onFilterChange(): void {
    
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
    
    this.openUserForm(user);
  }

  deleteUser(user: User): void {
    
  }


  resetPassword(user: User): void {
    
  }

  // Bulk actions
  activateSelected(): void {
    
  }

  deactivateSelected(): void {
    
  }

  exportSelected(): void {
    
  }

  deleteSelected(): void {
    
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




  changeRole(user: User): void {
    
  }

  viewUserActivity(user: User): void {
    
  }

  viewUserPermissions(user: User): void {
    
  }

  bulkActivate(): void {
    
    this.activateSelected();
  }

  bulkDeactivate(): void {
    
    this.deactivateSelected();
  }

  bulkExport(): void {
    
    this.exportSelected();
  }

  bulkDelete(): void {
    
    this.deleteSelected();
  }
}


