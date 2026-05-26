import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';

import { CommandeService } from './commande.service';
import { ClientService } from '../../core/services/client.service';
import { PlateformeService } from '../../core/services/plateforme.service';
import { MarqueService, Marque } from './marque.service';
import { ArticleService } from '../../core/services/article.service';
import { ModeleBomService, ModeleBom } from './modele-bom.service';

interface TailleLigne { taille: string; quantite: number; }
interface BomLigneSaisie { articleId: number; quantiteParPiece: number; unite: string; }

@Component({
  selector: 'app-commande-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>shopping_cart</mat-icon>
            {{ isEdit ? 'Modifier' : 'Nouvel' }} Ordre de Fabrication
          </mat-card-title>
          <mat-card-subtitle>{{ isEdit ? 'Modifier un ordre existant' : 'Créer un nouvel ordre de fabrication' }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="commandeForm" (ngSubmit)="onSubmit()">

            <!-- Informations générales -->
            <div class="section-header">
              <mat-icon>info</mat-icon>
              <h3>Informations générales</h3>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom / Description de la commande</mat-label>
              <input matInput formControlName="titreCommande" placeholder="Ex: Collection Été 2026 - Marque X">
              <mat-icon matSuffix>title</mat-icon>
              <mat-error *ngIf="commandeForm.get('titreCommande')?.hasError('required')">Nom requis</mat-error>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Numéro de commande</mat-label>
                <input matInput formControlName="numeroCommande" readonly>
                <mat-icon matSuffix>confirmation_number</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Date de commande</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dateCommande" required>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="commandeForm.get('dateCommande')?.hasError('required')">Date requise</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Client</mat-label>
                <mat-select formControlName="clientId" required>
                  <mat-option *ngFor="let c of clients" [value]="c.id">
                    {{ c.nom }} {{ c.prenom }}
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="commandeForm.get('clientId')?.hasError('required')">Client requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Date de livraison souhaitée</mat-label>
                <input matInput [matDatepicker]="picker2" formControlName="dateLivraisonSouhaitee">
                <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
                <mat-datepicker #picker2></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Plateforme</mat-label>
                <mat-select formControlName="plateformeId" (selectionChange)="onPlateformeChange($event.value)">
                  <mat-option [value]="null">-- Toutes --</mat-option>
                  <mat-option *ngFor="let p of plateformes" [value]="p.id">{{ p.nom }}</mat-option>
                </mat-select>
                <mat-icon matSuffix>business</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Marque</mat-label>
                <mat-select formControlName="marqueId">
                  <mat-option [value]="null">-- Aucune marque --</mat-option>
                  <mat-option *ngFor="let m of marquesFiltrees" [value]="m.id">{{ m.nom }}</mat-option>
                </mat-select>
                <mat-icon matSuffix>label</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Statut</mat-label>
                <mat-select formControlName="statut" required>
                  <mat-option value="EnAttente">En attente</mat-option>
                  <mat-option value="Prete">Prête</mat-option>
                  <mat-option value="EnProduction">En production</mat-option>
                  <mat-option value="Terminee">Terminée</mat-option>
                  <mat-option value="Annulee">Annulée</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Priorité</mat-label>
                <mat-select formControlName="priorite">
                  <mat-option value="Basse">Basse</mat-option>
                  <mat-option value="Normale">Normale</mat-option>
                  <mat-option value="Haute">Haute</mat-option>
                  <mat-option value="Urgente">Urgente</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Quantités par taille -->
            <div class="section-header">
              <mat-icon>straighten</mat-icon>
              <h3>Quantités par taille</h3>
            </div>

            <div class="taille-list">
              <div *ngFor="let t of taillesDynamiques; let i = index" class="taille-row">
                <mat-form-field appearance="outline" class="taille-input">
                  <mat-label>Taille</mat-label>
                  <input matInput [(ngModel)]="t.taille" [ngModelOptions]="{standalone: true}"
                         placeholder="S, M, L, 36, 38...">
                </mat-form-field>
                <mat-form-field appearance="outline" class="qte-input">
                  <mat-label>Quantité</mat-label>
                  <input matInput type="number" min="0"
                         [(ngModel)]="t.quantite" [ngModelOptions]="{standalone: true}"
                         (ngModelChange)="recalculerTotal()">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeTaille(i)"
                        matTooltip="Supprimer cette taille">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <div *ngIf="taillesDynamiques.length === 0" class="empty-hint">
                <mat-icon>info</mat-icon> Aucune taille. Cliquez sur "+ Ajouter taille".
              </div>
            </div>

            <button mat-stroked-button type="button" color="primary" (click)="addTaille()" class="add-btn">
              <mat-icon>add</mat-icon> Ajouter taille
            </button>

            <div class="total-pieces-row">
              <mat-icon>inventory_2</mat-icon>
              <span>Total pièces :&nbsp;</span>
              <strong class="total-pieces-value">{{ nbPieces }}</strong>
              <span>&nbsp;pcs</span>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Nomenclature BOM -->
            <div class="section-header">
              <mat-icon>account_tree</mat-icon>
              <h3>Nomenclature (BOM)</h3>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Charger un modèle BOM</mat-label>
                <mat-select [(ngModel)]="selectedModeleBomId"
                            [ngModelOptions]="{standalone: true}"
                            (selectionChange)="onModeleBomChange($event.value)">
                  <mat-option [value]="null">-- Saisie manuelle --</mat-option>
                  <mat-option *ngFor="let m of modelesBom" [value]="m.id">
                    {{ m.nom }}<ng-container *ngIf="m.fournitures?.length"> ({{ m.fournitures.length }} fournitures)</ng-container>
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>account_tree</mat-icon>
                <mat-hint>Pré-remplit les fournitures — vous pouvez ensuite les ajuster</mat-hint>
              </mat-form-field>
            </div>

            <div class="bom-list">
              <div *ngFor="let b of bomLignes; let i = index" class="bom-row">
                <mat-form-field appearance="outline" class="article-select">
                  <mat-label>Article / Fourniture</mat-label>
                  <mat-select [(ngModel)]="b.articleId" [ngModelOptions]="{standalone: true}">
                    <mat-option *ngFor="let a of articles" [value]="a.id">
                      {{ a.designation }} ({{ a.unite }})
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="qte-input">
                  <mat-label>Qté / pièce</mat-label>
                  <input matInput type="number" min="0" step="0.001"
                         [(ngModel)]="b.quantiteParPiece" [ngModelOptions]="{standalone: true}">
                </mat-form-field>
                <mat-form-field appearance="outline" class="unite-input">
                  <mat-label>Unité</mat-label>
                  <input matInput [(ngModel)]="b.unite" [ngModelOptions]="{standalone: true}"
                         placeholder="m, kg, pcs...">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeBomLigne(i)"
                        matTooltip="Supprimer cette fourniture">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <div *ngIf="bomLignes.length === 0" class="empty-hint">
                <mat-icon>info</mat-icon> Aucune fourniture. Cliquez sur "+ Ajouter fourniture".
              </div>
            </div>

            <button mat-stroked-button type="button" color="primary" (click)="addBomLigne()" class="add-btn">
              <mat-icon>add</mat-icon> Ajouter fourniture
            </button>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Sécurité -->
            <div class="section-header">
              <mat-icon>security</mat-icon>
              <h3>Marge de sécurité</h3>
            </div>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>% Sécurité</mat-label>
              <input matInput type="number" formControlName="pctSecurite" min="0" max="20">
              <span matSuffix>%</span>
              <mat-hint>Marge ajoutée aux besoins calculés (défaut : 5 %)</mat-hint>
              <mat-error *ngIf="commandeForm.get('pctSecurite')?.hasError('min')">Minimum 0 %</mat-error>
              <mat-error *ngIf="commandeForm.get('pctSecurite')?.hasError('max')">Maximum 20 %</mat-error>
            </mat-form-field>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Notes -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes et commentaires</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
              <mat-icon matSuffix>note</mat-icon>
            </mat-form-field>

          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="onCancel()">
            <mat-icon>cancel</mat-icon>
            Annuler
          </button>
          <button mat-raised-button color="primary"
                  [disabled]="commandeForm.invalid || isSubmitting || nbPieces === 0"
                  (click)="onSubmit()">
            <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
            <mat-icon *ngIf="!isSubmitting">{{ isEdit ? 'update' : 'save' }}</mat-icon>
            <span *ngIf="!isSubmitting">{{ isEdit ? 'Modifier' : 'Créer' }}</span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container { max-width: 860px; margin: 20px auto; padding: 0 16px; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .half-width { width: calc(50% - 8px); margin-bottom: 12px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .section-header { display: flex; align-items: center; gap: 8px; margin: 20px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e3f2fd; }
    .section-header h3 { margin: 0; flex: 1; color: #1976d2; font-size: 1rem; }
    .section-divider { margin: 8px 0 4px; }

    /* Tailles dynamiques */
    .taille-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
    .taille-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .taille-input { width: 180px; }
    .qte-input { width: 130px; }

    /* BOM dynamique */
    .bom-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
    .bom-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .article-select { flex: 1; min-width: 220px; }
    .unite-input { width: 110px; }

    .add-btn { margin-bottom: 16px; }
    .empty-hint { display: flex; align-items: center; gap: 8px; color: #999; padding: 8px 0; font-size: 0.875rem; }

    .total-pieces-row { display: flex; align-items: center; gap: 4px; padding: 8px 12px; background: #e3f2fd; border-radius: 8px; margin: 8px 0 12px; color: #333; }
    .total-pieces-value { font-size: 1.3rem; color: #1976d2; }

    mat-card-actions { padding: 16px 24px; gap: 12px; display: flex; justify-content: flex-end; }

    @media (max-width: 768px) {
      .form-row { flex-direction: column; }
      .half-width { width: 100%; }
      .taille-row, .bom-row { flex-direction: column; align-items: flex-start; }
      .taille-input, .qte-input, .article-select, .unite-input { width: 100%; }
    }
  `]
})
export class CommandeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private commandeService = inject(CommandeService);
  private clientService = inject(ClientService);
  private plateformeService = inject(PlateformeService);
  private marqueService = inject(MarqueService);
  private articleService = inject(ArticleService);
  private modeleBomService = inject(ModeleBomService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  commandeForm: FormGroup;
  isEdit = false;
  commandeId: number | null = null;
  isSubmitting = false;

  clients: any[] = [];
  plateformes: any[] = [];
  marquesFiltrees: Marque[] = [];
  articles: any[] = [];

  taillesDynamiques: TailleLigne[] = [];
  bomLignes: BomLigneSaisie[] = [];
  modelesBom: ModeleBom[] = [];
  selectedModeleBomId: number | null = null;
  nbPieces = 0;

  constructor() {
    this.commandeForm = this.fb.group({
      numeroCommande: [''],
      titreCommande: ['', Validators.required],
      clientId: ['', Validators.required],
      dateCommande: [new Date(), Validators.required],
      dateLivraisonSouhaitee: [null],
      plateformeId: [null],
      marqueId: [null],
      statut: ['EnAttente', Validators.required],
      priorite: ['Normale'],
      pctSecurite: [5, [Validators.min(0), Validators.max(20)]],
      notes: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idParam;
    this.commandeId = idParam ? +idParam : null;
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadPlateformes();
    this.loadArticles();
    this.loadModelesBom();
    if (this.isEdit && this.commandeId) {
      this.loadCommandeExistante();
    } else {
      this.generateNumeroCommande();
    }
  }

  private generateNumeroCommande(): void {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.commandeForm.patchValue({
      numeroCommande: `OF-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${rand}`
    });
  }

  private loadClients(): void {
    this.clientService.getAll().subscribe({ next: (data) => this.clients = data, error: () => {} });
  }

  private loadPlateformes(): void {
    this.plateformeService.getAll().subscribe({ next: (data) => this.plateformes = data, error: () => {} });
  }

  private loadArticles(): void {
    this.articleService.getAll().subscribe({ next: (data) => this.articles = data, error: () => {} });
  }

  private loadCommandeExistante(): void {
    this.commandeService.getById(this.commandeId!).subscribe({
      next: (commande: any) => {
        this.commandeForm.patchValue({
          numeroCommande:         commande.numeroCommande,
          titreCommande:          commande.titreCommande,
          clientId:               commande.clientId,
          dateCommande:           commande.dateCommande ? new Date(commande.dateCommande) : null,
          dateLivraisonSouhaitee: commande.dateLivraisonSouhaitee ? new Date(commande.dateLivraisonSouhaitee) : null,
          plateformeId:           commande.plateformeId ?? null,
          marqueId:               commande.marqueId ?? null,
          statut:                 commande.statut,
          priorite:               commande.priorite ?? 'Normale',
          pctSecurite:            commande.pctSecurite ?? 5,
          notes:                  commande.notesSpeciales ?? ''
        });
        if (commande.plateformeId) {
          this.onPlateformeChange(commande.plateformeId);
        }
      },
      error: () => this.snackBar.open('Erreur chargement commande', 'Fermer', { duration: 3000 })
    });

    this.commandeService.getTailles(this.commandeId!).subscribe({
      next: (tailles) => {
        this.taillesDynamiques = tailles.map(t => ({ taille: t.taille, quantite: t.quantite }));
        this.recalculerTotal();
      },
      error: () => {}
    });

    this.commandeService.getBom(this.commandeId!).subscribe({
      next: (bom) => {
        this.bomLignes = bom.map(b => ({ articleId: b.articleId, quantiteParPiece: b.quantiteParPiece, unite: b.unite ?? '' }));
      },
      error: () => {}
    });
  }

  onPlateformeChange(plateformeId: number | null): void {
    this.marquesFiltrees = [];
    this.commandeForm.patchValue({ marqueId: null });
    if (plateformeId) {
      this.marqueService.getByPlateforme(plateformeId).subscribe({
        next: (data) => this.marquesFiltrees = data.filter(m => m.estActive),
        error: () => {}
      });
    }
  }

  // --- Tailles ---
  addTaille(): void {
    this.taillesDynamiques.push({ taille: '', quantite: 0 });
  }

  removeTaille(i: number): void {
    this.taillesDynamiques.splice(i, 1);
    this.recalculerTotal();
  }

  recalculerTotal(): void {
    this.nbPieces = this.taillesDynamiques.reduce((s, t) => s + (Number(t.quantite) || 0), 0);
  }

  // --- BOM ---
  addBomLigne(): void {
    this.bomLignes.push({ articleId: 0, quantiteParPiece: 0, unite: '' });
  }

  removeBomLigne(i: number): void {
    this.bomLignes.splice(i, 1);
  }

  private loadModelesBom(): void {
    this.modeleBomService.getAll().subscribe({
      next: (data) => this.modelesBom = data,
      error: () => {}
    });
  }

  onModeleBomChange(id: number | null): void {
    if (!id) return;
    const modele = this.modelesBom.find(m => m.id === id);
    if (!modele?.fournitures?.length) return;
    this.bomLignes = modele.fournitures.map(f => ({
      articleId: f.articleId,
      quantiteParPiece: f.qteParPiece,
      unite: f.unite
    }));
  }

  // --- Actions ---
  onSubmit(): void {
    if (this.commandeForm.invalid || this.isSubmitting) {
      Object.keys(this.commandeForm.controls).forEach(k => this.commandeForm.get(k)?.markAsTouched());
      return;
    }
    if (this.nbPieces === 0) {
      this.snackBar.open('Veuillez saisir au moins une pièce dans les tailles', 'OK', { duration: 4000 });
      return;
    }

    this.isSubmitting = true;
    const payload = { ...this.commandeForm.value };
    const onError = (err: any) => {
      this.snackBar.open(err?.error?.message || 'Erreur serveur', 'Fermer', { duration: 5000 });
      this.isSubmitting = false;
    };

    if (this.isEdit && this.commandeId) {
      this.commandeService.updateCommande(this.commandeId, payload).subscribe({
        next: () => this.saveTaillesBom(this.commandeId!),
        error: onError
      });
    } else {
      this.commandeService.createCommande(payload).subscribe({
        next: (commande: any) => this.saveTaillesBom(commande.id),
        error: onError
      });
    }
  }

  private saveTaillesBom(id: number): void {
    const taillesValides = this.taillesDynamiques.filter(t => t.taille.trim() && t.quantite > 0);
    const bomValides = this.bomLignes.filter(b => b.articleId > 0 && b.quantiteParPiece > 0);

    const saves: Observable<any>[] = [];
    if (taillesValides.length > 0) saves.push(this.commandeService.setTailles(id, taillesValides));
    if (bomValides.length > 0) saves.push(this.commandeService.setBom(id, bomValides));

    const afterSave = () => {
      const msg = this.isEdit ? 'Ordre de fabrication modifié avec succès' : 'Ordre de fabrication créé avec succès';
      this.snackBar.open(msg, 'OK', { duration: 3000 });
      this.router.navigate(['/commandes', id, 'details']);
      this.isSubmitting = false;
    };

    if (saves.length > 0) {
      forkJoin(saves).subscribe({
        next: () => afterSave(),
        error: () => {
          this.snackBar.open('Erreur sauvegarde tailles/BOM', 'Fermer', { duration: 5000 });
          this.isSubmitting = false;
        }
      });
    } else {
      afterSave();
    }
  }

  onCancel(): void {
    this.router.navigate(['/commandes']);
  }
}
