import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { AchatService, Achat } from '../../core/services/achat.service';

interface IStatFournisseur { nom: string; nbAchats: number; montantTotal: number; }
interface IStatMois       { label: string; nbAchats: number; montantTotal: number; }
interface IStatStatut     { statut: string; nbAchats: number; montantTotal: number; }

@Component({
  selector: 'app-rapport-achats',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './rapport-achats.component.html',
  styleUrls: ['./rapport-achats.component.scss']
})
export class RapportAchatsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  montantTotal = 0;
  nbAchats = 0;
  topFournisseur = '—';
  topMois = '—';

  parFournisseur: IStatFournisseur[] = [];
  colsFournisseur = ['nom', 'nbAchats', 'montantTotal'];

  parMois: IStatMois[] = [];
  colsMois = ['label', 'nbAchats', 'montantTotal'];

  parStatut: IStatStatut[] = [];
  colsStatut = ['statut', 'nbAchats', 'montantTotal'];

  colsDetail = ['referenceAchat', 'fournisseur', 'dateAchat', 'montantHT', 'montantTotal', 'statut'];
  detailSource = new MatTableDataSource<Achat>([]);

  dateDebut: Date | null = null;
  dateFin: Date | null = null;
  isLoading = false;
  error: string | null = null;

  private allAchats: Achat[] = [];
  private readonly monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  constructor(private achatService: AchatService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.dateFin = new Date();
    this.dateDebut = new Date();
    this.dateDebut.setDate(this.dateFin.getDate() - 30);
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.detailSource.paginator = this.paginator;
    this.detailSource.sort = this.sort;
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;
    this.achatService.getAll().subscribe({
      next: (data) => {
        this.allAchats = data;
        this.computeStats();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des achats';
        this.isLoading = false;
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  private computeStats(): void {
    const filtered = this.filterByDate(this.allAchats);

    this.nbAchats = filtered.length;
    this.montantTotal = filtered.reduce((s, a) => s + (a.montantTotal ?? 0), 0);

    const fMap = new Map<string, IStatFournisseur>();
    filtered.forEach(a => {
      const nom = a.fournisseur?.nomEntreprise ?? 'Inconnu';
      const s = fMap.get(nom) ?? { nom, nbAchats: 0, montantTotal: 0 };
      s.nbAchats++;
      s.montantTotal += a.montantTotal ?? 0;
      fMap.set(nom, s);
    });
    this.parFournisseur = Array.from(fMap.values()).sort((a, b) => b.montantTotal - a.montantTotal);
    this.topFournisseur = this.parFournisseur[0]?.nom ?? '—';

    const mMap = new Map<string, IStatMois>();
    filtered.forEach(a => {
      const d = new Date(a.dateAchat);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const label = `${this.monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const s = mMap.get(key) ?? { label, nbAchats: 0, montantTotal: 0 };
      s.nbAchats++;
      s.montantTotal += a.montantTotal ?? 0;
      mMap.set(key, s);
    });
    this.parMois = Array.from(mMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
    this.topMois = this.parMois.reduce(
      (max, m) => m.montantTotal > max.montantTotal ? m : max,
      { label: '—', nbAchats: 0, montantTotal: 0 }
    ).label;

    const sMap = new Map<string, IStatStatut>();
    filtered.forEach(a => {
      const statut = a.statut ?? 'Inconnu';
      const s = sMap.get(statut) ?? { statut, nbAchats: 0, montantTotal: 0 };
      s.nbAchats++;
      s.montantTotal += a.montantTotal ?? 0;
      sMap.set(statut, s);
    });
    this.parStatut = Array.from(sMap.values()).sort((a, b) => b.nbAchats - a.nbAchats);

    this.detailSource.data = filtered;
  }

  private filterByDate(achats: Achat[]): Achat[] {
    if (!this.dateDebut || !this.dateFin) return achats;
    return achats.filter(a => {
      const d = new Date(a.dateAchat);
      return d >= this.dateDebut! && d <= this.dateFin!;
    });
  }

  applyFilters(): void { this.computeStats(); }

  refreshData(): void {
    this.loadData();
    this.snackBar.open('Données actualisées', 'Fermer', { duration: 2000 });
  }
}
