import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ImportationService, Importation, DocumentImportation } from './importation.service';

@Component({
  selector: 'app-importation-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './importation-details.component.html',
  styleUrls: ['./importation-details.component.scss']
})
export class ImportationDetailsComponent implements OnInit {
  importation: Importation | null = null;
  loading = true;
  displayedColumns: string[] = ['article', 'quantite', 'prixUnitaire', 'total', 'statut', 'actions'];

  documents: DocumentImportation[] = [];
  loadingDocuments = false;
  pendingFileName: string | null = null;

  get articlesDataSource() {
    return (this.importation as any)?.lignesImportation || [];
  }

  constructor(
    private importationService: ImportationService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadImportation();
  }

  loadImportation(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.importationService.getById(+id).subscribe({
        next: (importation) => {
          this.importation = importation;
          this.loading = false;
          this.loadDocuments(+id);
        },
        error: () => {
          this.snackBar.open('Erreur lors du chargement de l\'importation', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  loadDocuments(importationId: number): void {
    this.loadingDocuments = true;
    this.importationService.getDocuments(importationId).subscribe({
      next: (docs) => { this.documents = docs; this.loadingDocuments = false; },
      error: () => { this.loadingDocuments = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.importation?.id) return;
    const file = input.files[0];
    this.pendingFileName = file.name;
    this.loadingDocuments = true;
    this.importationService.uploadDocument(this.importation.id, file).subscribe({
      next: () => {
        this.snackBar.open('Document ajouté avec succès', 'Fermer', { duration: 3000 });
        this.pendingFileName = null;
        this.loadDocuments(this.importation!.id!);
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'upload', 'Fermer', { duration: 3000 });
        this.pendingFileName = null;
        this.loadingDocuments = false;
      }
    });
    input.value = '';
  }

  telechargerDocument(docId: number): void {
    window.open(this.importationService.telechargerDocumentUrl(docId), '_blank');
  }

  supprimerDocument(docId: number): void {
    if (!confirm('Supprimer ce document ?')) return;
    this.importationService.supprimerDocument(docId).subscribe({
      next: () => {
        this.snackBar.open('Document supprimé', 'Fermer', { duration: 3000 });
        this.loadDocuments(this.importation!.id!);
      },
      error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
    });
  }

  // Méthodes appelées par le HTML externe

  uploadDocument(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,image/*';
    input.onchange = (e) => this.onFileSelected(e as Event);
    input.click();
  }

  viewDocument(type: string): void {
    this.snackBar.open(`Aperçu "${type}" non disponible`, 'Fermer', { duration: 2000 });
  }

  isStepCompleted(step: string): boolean {
    const order = ['Brouillon', 'Soumise', 'Validee', 'Recue'];
    const idx = order.indexOf(this.importation?.statut || '');
    const stepOrder: Record<string, number> = {
      commande: 0, expedition: 1, transit: 2, douane: 2, reception: 3
    };
    return idx >= (stepOrder[step] ?? 99);
  }

  getTransitStatus(): string {
    const s = this.importation?.statut;
    if (s === 'Recue') return 'Arrivé';
    if (s === 'Validee') return 'En cours';
    return 'En attente';
  }

  getTotalCost(): number {
    const i = this.importation as any;
    return (i?.valeurMarchandises || 0) + (i?.fraisTransport || 0)
         + (i?.droitsDouane || 0) + (i?.tva || 0) + (i?.autresFrais || 0);
  }

  addArticle(): void {
    this.snackBar.open('Fonctionnalité en cours de développement', 'Fermer', { duration: 2000 });
  }

  editLigne(ligne: any): void { this.onEditLigne(ligne); }
  deleteLigne(ligne: any): void { this.onDeleteLigne(ligne); }

  saveNotes(): void {
    if (!this.importation?.id) return;
    this.importationService.update(this.importation.id, { notes: this.importation.notes } as any).subscribe({
      next: () => this.snackBar.open('Notes enregistrées', 'Fermer', { duration: 2000 }),
      error: () => this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 })
    });
  }

  editImportation(): void { this.onEdit(); }
  duplicateImportation(): void { this.onDuplicate(); }
  deleteImportation(): void { this.onDelete(); }

  generateReport(): void {
    this.snackBar.open('Génération du rapport en cours de développement', 'Fermer', { duration: 2000 });
  }

  // Méthodes partagées

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'Soumise': return 'accent';
      case 'Validee': return 'primary';
      case 'Recue': return 'primary';
      case 'Annulee': return 'warn';
      default: return 'primary';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'Brouillon': return 'Brouillon';
      case 'Soumise': return 'Soumise';
      case 'Validee': return 'Validée';
      case 'Recue': return 'Reçue';
      case 'Annulee': return 'Annulée';
      default: return statut;
    }
  }

  onEdit(): void {
    if (this.importation?.id) {
      this.router.navigate(['/importations', this.importation.id, 'edit']);
    }
  }

  onDuplicate(): void {
    this.snackBar.open('Fonctionnalité de duplication en cours de développement', 'Fermer', { duration: 2000 });
  }

  onDelete(): void {
    if (this.importation?.id) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette importation ?')) {
        this.importationService.delete(this.importation.id).subscribe({
          next: () => {
            this.snackBar.open('Importation supprimée avec succès', 'Fermer', { duration: 3000 });
            this.router.navigate(['/importations']);
          },
          error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
        });
      }
    }
  }

  onEditLigne(ligne: any): void {
    this.snackBar.open('Édition de ligne en cours de développement', 'Fermer', { duration: 2000 });
  }

  onDeleteLigne(ligne: any): void {
    if (confirm('Supprimer cette ligne ?')) {
      this.snackBar.open('Suppression de ligne en cours de développement', 'Fermer', { duration: 2000 });
    }
  }

  onBack(): void {
    this.router.navigate(['/importations']);
  }
}
