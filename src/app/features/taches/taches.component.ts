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
import { Router } from '@angular/router';

import { TacheService } from './tache.service';
import { TacheProduction as Task, StatutTache } from '../../shared/models/tache.model';

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
  private allTasks: Task[] = [];

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
    private tacheService: TacheService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
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
    this.tacheService.getAll().subscribe({
      next: (tasks) => {
        this.allTasks = tasks;
        this.applyFilters();
        this.totalItems = tasks.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
        this.snackBar.open('Erreur lors du chargement des tâches', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.tacheService.getAll().subscribe({
      next: (tasks) => {
        this.stats = {
          totalTasks: tasks.length,
          tasksEnCours: tasks.filter(t => t.statut === StatutTache.EnCours).length,
          tasksTerminees: tasks.filter(t => t.statut === StatutTache.Termine).length,
          productivite: tasks.length > 0 ? Math.round((tasks.filter(t => t.statut === StatutTache.Termine).length / tasks.length) * 100) : 0
        };
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.allTasks;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.titre?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(t => t.statut === this.selectedStatus);
    }

    if (this.selectedPriority) {
      filtered = filtered.filter(t => t.priorite === this.selectedPriority);
    }

    if (this.selectedAssignee) {
      filtered = filtered.filter(t =>
        t.assigneA?.toLowerCase().includes(this.selectedAssignee.toLowerCase())
      );
    }

    this.dataSource.data = filtered;
    this.totalItems = filtered.length;
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
      case 'Haute':    return 'warn';
      case 'Critique': return 'warn';
      case 'Normale':  return 'accent';
      default:         return 'primary';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'Critique': return 'priority_high';
      case 'Haute':    return 'priority_high';
      case 'Normale':  return 'remove';
      case 'Basse':    return 'keyboard_arrow_down';
      default:         return 'help';
    }
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'Haute':    return 'Haute';
      case 'Critique': return 'Critique';
      case 'Normale':  return 'Normale';
      case 'Basse':    return 'Basse';
      default:         return priority || 'Inconnu';
    }
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'Termine':     return 'primary';
      case 'EnCours':     return 'accent';
      case 'Annule':      return 'warn';
      case 'Bloque':      return 'warn';
      default:            return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'NonCommence': return 'schedule';
      case 'EnCours':     return 'play_arrow';
      case 'Bloque':      return 'block';
      case 'Termine':     return 'check_circle';
      case 'Annule':      return 'cancel';
      default:            return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'NonCommence': return 'Non commencée';
      case 'EnCours':     return 'En cours';
      case 'Bloque':      return 'Bloquée';
      case 'Termine':     return 'Terminée';
      case 'Annule':      return 'Annulée';
      default:            return status || 'Inconnu';
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
    this.router.navigate(['/taches/nouveau']);
  }

  viewTask(task: Task): void {
    this.router.navigate(['/taches', task.id, 'details']);
  }

  editTask(task: Task): void {
    this.router.navigate(['/taches', task.id]);
  }

  startTask(task: Task): void {
    this.tacheService.commencerTache(task.id!, '').subscribe({
      next: () => { this.snackBar.open(`Tâche "${task.titre}" démarrée`, 'Fermer', { duration: 3000 }); this.loadTasks(); this.loadStats(); },
      error: (err) => { this.snackBar.open('Erreur lors du démarrage', 'Fermer', { duration: 3000 }); console.error(err); }
    });
  }

  completeTask(task: Task): void {
    this.tacheService.terminerTache(task.id!).subscribe({
      next: () => { this.snackBar.open(`Tâche "${task.titre}" terminée`, 'Fermer', { duration: 3000 }); this.loadTasks(); this.loadStats(); },
      error: (err) => { this.snackBar.open('Erreur lors de la clôture', 'Fermer', { duration: 3000 }); console.error(err); }
    });
  }

  assignTask(task: Task): void {
    this.snackBar.open(`Attribution de ${task.titre}`, 'Fermer', { duration: 3000 });
  }

  duplicateTask(task: Task): void {
    this.snackBar.open(`Duplication de ${task.titre}`, 'Fermer', { duration: 3000 });
  }

  cancelTask(task: Task): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler ${task.titre} ?`)) {
      this.tacheService.updateStatut(task.id!, StatutTache.Annule).subscribe({
        next: () => { this.snackBar.open('Tâche annulée', 'Fermer', { duration: 3000 }); this.loadTasks(); this.loadStats(); },
        error: (err) => { this.snackBar.open('Erreur lors de l\'annulation', 'Fermer', { duration: 3000 }); console.error(err); }
      });
    }
  }

  exportTasks(): void {
    this.snackBar.open('Export en cours de développement', 'Fermer', { duration: 3000 });
  }
}


