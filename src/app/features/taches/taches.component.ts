import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

interface Task {
  id: number;
  nom: string;
  description: string;
  priorite: string;
  statut: string;
  progression: number;
  dateEcheance: Date;
  assigneA?: {
    nom: string;
    prenom: string;
  };
}

interface TaskStats {
  totalTasks: number;
  tasksEnCours: number;
  tasksTerminees: number;
  productivite: number;
}

@Component({
  selector: 'app-taches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule
  ],
  templateUrl: './taches.component.html',
  styleUrl: './taches.component.scss'
})
export class TachesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['task', 'priority', 'status', 'assignee', 'progress', 'deadline', 'actions'];
  dataSource = new MatTableDataSource<Task>([]);

  // Data
  stats: TaskStats | null = null;

  // Filters
  searchTerm = '';
  selectedStatus = '';
  selectedPriority = '';
  selectedAssignee = '';

  // Pagination
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;

  // UI State
  loading = false;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadStats();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTasks(): void {
    this.loading = true;
    // Simulation de données
    setTimeout(() => {
      const mockTasks: Task[] = [
        {
          id: 1,
          nom: 'Production Lot A',
          description: 'Production de 1000 unités du lot A',
          priorite: 'HAUTE',
          statut: 'EN_COURS',
          progression: 65,
          dateEcheance: new Date(Date.now() + 86400000 * 3),
          assigneA: { nom: 'Dupont', prenom: 'Jean' }
        },
        {
          id: 2,
          nom: 'Contrôle Qualité',
          description: 'Contrôle qualité des articles textiles',
          priorite: 'MOYENNE',
          statut: 'EN_ATTENTE',
          progression: 0,
          dateEcheance: new Date(Date.now() + 86400000 * 7)
        }
      ];
      this.dataSource.data = mockTasks;
      this.totalItems = mockTasks.length;
      this.loading = false;
    }, 1000);
  }

  loadStats(): void {
    this.stats = {
      totalTasks: 25,
      tasksEnCours: 8,
      tasksTerminees: 15,
      productivite: 85
    };
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.snackBar.open('Filtres appliqués', 'Fermer', { duration: 2000 });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.selectedAssignee = '';
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }

  // Helper methods
  getPriorityColor(priority: string): 'primary' | 'accent' | 'warn' {
    switch (priority) {
      case 'HAUTE': return 'warn';
      case 'MOYENNE': return 'accent';
      default: return 'primary';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'HAUTE': return 'priority_high';
      case 'MOYENNE': return 'remove';
      case 'BASSE': return 'keyboard_arrow_down';
      default: return 'help';
    }
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'HAUTE': return 'Haute';
      case 'MOYENNE': return 'Moyenne';
      case 'BASSE': return 'Basse';
      default: return priority;
    }
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'TERMINEE': return 'primary';
      case 'EN_COURS': return 'accent';
      case 'ANNULEE': return 'warn';
      default: return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'schedule';
      case 'EN_COURS': return 'play_arrow';
      case 'TERMINEE': return 'check_circle';
      case 'ANNULEE': return 'cancel';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'ANNULEE': return 'Annulée';
      default: return status;
    }
  }

  getProgressColor(progress: number): 'primary' | 'accent' | 'warn' {
    if (progress >= 80) return 'primary';
    if (progress >= 50) return 'accent';
    return 'warn';
  }

  isOverdue(deadline: Date): boolean {
    return new Date() > deadline;
  }

  // Action methods
  openTaskForm(): void {
    this.snackBar.open('Fonctionnalité en cours de développement', 'Fermer', { duration: 3000 });
  }

  viewTask(task: Task): void {
    this.snackBar.open(`Affichage des détails de ${task.nom}`, 'Fermer', { duration: 3000 });
  }

  editTask(task: Task): void {
    this.snackBar.open(`Modification de ${task.nom}`, 'Fermer', { duration: 3000 });
  }

  startTask(task: Task): void {
    this.snackBar.open(`Démarrage de ${task.nom}`, 'Fermer', { duration: 3000 });
  }

  completeTask(task: Task): void {
    this.snackBar.open(`${task.nom} marquée comme terminée`, 'Fermer', { duration: 3000 });
  }

  assignTask(task: Task): void {
    this.snackBar.open(`Attribution de ${task.nom}`, 'Fermer', { duration: 3000 });
  }

  duplicateTask(task: Task): void {
    this.snackBar.open(`Duplication de ${task.nom}`, 'Fermer', { duration: 3000 });
  }

  cancelTask(task: Task): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler ${task.nom} ?`)) {
      this.snackBar.open('Tâche annulée', 'Fermer', { duration: 3000 });
    }
  }

  exportTasks(): void {
    this.snackBar.open('Export en cours de développement', 'Fermer', { duration: 3000 });
  }
}
