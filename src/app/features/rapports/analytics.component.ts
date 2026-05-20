import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AchatService } from '../../core/services/achat.service';

interface KpiData {
  montantAchats: number;
  nbAchats: number;
  montantAchatsMois: number;
  nbAchatsMois: number;
  topFournisseur: string;
  nbArticles: number;
  valeurStock: number;
  nbAlertes: number;
  nbTachesEnCours: number;
  nbFournisseurs: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  private http = inject(HttpClient);
  private achatService = inject(AchatService);
  private snackBar = inject(MatSnackBar);
  private apiUrl = environment.apiUrl;

  kpi: KpiData = {
    montantAchats: 0, nbAchats: 0,
    montantAchatsMois: 0, nbAchatsMois: 0,
    topFournisseur: '—',
    nbArticles: 0, valeurStock: 0,
    nbAlertes: 0, nbTachesEnCours: 0,
    nbFournisseurs: 0
  };
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadKpis();
  }

  loadKpis(): void {
    this.loading = true;
    this.error = null;

    const articles$ = this.http.get<{ totalRecords: number }>(`${this.apiUrl}/Article?pageSize=1`).pipe(catchError(() => of({ totalRecords: 0 })));
    const stock$ = this.http.get<{ article: { prixUnitaireMoyen: number }; quantite: number }[]>(`${this.apiUrl}/Stock`).pipe(catchError(() => of([])));
    const alertes$ = this.http.get<unknown[]>(`${this.apiUrl}/Stock/Alertes`).pipe(catchError(() => of([])));
    const taches$ = this.http.get<{ enCours: number }>(`${this.apiUrl}/TacheProduction/Dashboard`).pipe(catchError(() => of({ enCours: 0 })));
    const achats$ = this.achatService.getAll().pipe(catchError(() => of([])));

    forkJoin({ articles: articles$, stock: stock$, alertes: alertes$, taches: taches$, achats: achats$ })
      .pipe(
        map(r => {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

          const achats = r.achats as any[];
          const achatsMois = achats.filter(a => new Date(a.dateAchat) >= startOfMonth);

          const fMap = new Map<string, number>();
          achats.forEach(a => {
            const nom = a.fournisseur?.nom ?? 'Inconnu';
            fMap.set(nom, (fMap.get(nom) ?? 0) + (a.montantTotal ?? 0));
          });
          const topFournisseur = fMap.size > 0
            ? [...fMap.entries()].sort((a, b) => b[1] - a[1])[0][0]
            : '—';

          return {
            montantAchats: achats.reduce((s: number, a: any) => s + (a.montantTotal ?? 0), 0),
            nbAchats: achats.length,
            montantAchatsMois: achatsMois.reduce((s: number, a: any) => s + (a.montantTotal ?? 0), 0),
            nbAchatsMois: achatsMois.length,
            topFournisseur,
            nbFournisseurs: fMap.size,
            nbArticles: r.articles.totalRecords ?? 0,
            valeurStock: (r.stock as any[]).reduce((s, i) => s + (i.article?.prixUnitaireMoyen ?? 0) * (i.quantite ?? 0), 0),
            nbAlertes: (r.alertes as any[]).length,
            nbTachesEnCours: r.taches?.enCours ?? 0
          } as KpiData;
        })
      )
      .subscribe({
        next: kpi => { this.kpi = kpi; this.loading = false; },
        error: () => {
          this.error = 'Erreur lors du chargement des KPIs';
          this.loading = false;
          this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
        }
      });
  }

  refreshData(): void {
    this.loadKpis();
    this.snackBar.open('Données actualisées', 'Fermer', { duration: 2000 });
  }
}
