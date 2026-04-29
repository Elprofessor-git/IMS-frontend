import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseApiService } from '../../core/services/base-api.service';
import { TacheProduction } from '../../shared/models/tache.model';

export interface ITache {
  id: number;
  commandeId: number;
  titre: string;
  description: string;
  statut: string | any;
  dateCreation: Date;
  dateDebut?: Date;
  dateFin?: Date;
  equipeId?: number;
  priorite: string | any;
}
export type Tache = ITache | TacheProduction;

@Injectable({
  providedIn: 'root'
})
export class TacheService extends BaseApiService<TacheProduction> {
  protected override endpoint = 'TacheProduction';
  private tachesSubject = new BehaviorSubject<TacheProduction[]>([]);

  constructor(http: HttpClient) {
    super(http);
    this.refreshTaches();
  }

  getTachesObservable(): Observable<TacheProduction[]> {
    return this.tachesSubject.asObservable();
  }

  refreshTaches(): void {
    this.http.get<TacheProduction[]>(`${this.apiUrl}`)
      .subscribe({
        next: taches => this.tachesSubject.next(taches),
        error: () => {}
      });
  }

  creerTache(tache: any): Observable<TacheProduction> {
    return this.http.post<TacheProduction>(`${this.apiUrl}`, tache)
      .pipe(tap(() => this.refreshTaches()));
  }

  updateStatut(id: number, statut: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/statut`, { statut })
      .pipe(tap(() => this.refreshTaches()));
  }

  assignerEquipe(id: number, equipeId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/equipe`, { equipeId })
      .pipe(tap(() => this.refreshTaches()));
  }

  getTachesParCommande(commandeId: number): Observable<TacheProduction[]> {
    return this.http.get<TacheProduction[]>(`${this.apiUrl}/commande/${commandeId}`);
  }

  genererTachesCommande(commandeId: number): Observable<TacheProduction[]> {
    return this.http.post<TacheProduction[]>(`${this.apiUrl}/generer/${commandeId}`, {})
      .pipe(tap(() => this.refreshTaches()));
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Dashboard`);
  }

  getByStatut(statut: string): Observable<TacheProduction[]> {
    return this.http.get<TacheProduction[]>(`${this.apiUrl}/Statut/${statut}`);
  }

  getByCommande(commandeId: number): Observable<TacheProduction[]> {
    return this.http.get<TacheProduction[]>(`${this.apiUrl}/ByCommande/${commandeId}`);
  }

  getByPriorite(priorite: string): Observable<TacheProduction[]> {
    return this.http.get<TacheProduction[]>(`${this.apiUrl}/Priorite/${priorite}`);
  }

  getTachesEnRetard(): Observable<TacheProduction[]> {
    return this.http.get<TacheProduction[]>(`${this.apiUrl}/EnRetard`);
  }

  commencerTache(id: number, assigneA: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Commencer`, { assigneA })
      .pipe(tap(() => this.refreshTaches()));
  }

  mettreAJourAvancement(id: number, pourcentage: number, commentaire?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/MettreAJourAvancement`, { pourcentage, commentaire })
      .pipe(tap(() => this.refreshTaches()));
  }

  terminerTache(id: number, commentaireFinal?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Terminer`, { commentaireFinal })
      .pipe(tap(() => this.refreshTaches()));
  }

  bloquerTache(id: number, motifBlocage: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Bloquer`, { motifBlocage })
      .pipe(tap(() => this.refreshTaches()));
  }

  debloquerTache(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Debloquer`, {})
      .pipe(tap(() => this.refreshTaches()));
  }

  assignerTache(id: number, assigneA: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Assigner`, { assigneA })
      .pipe(tap(() => this.refreshTaches()));
  }

  modifierPriorite(id: number, nouvellePriorite: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ModifierPriorite`, { priorite: nouvellePriorite })
      .pipe(tap(() => this.refreshTaches()));
  }

  modifierEcheance(id: number, nouvelleEcheance: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ModifierEcheance`, { dateFinPrevue: nouvelleEcheance.toISOString() })
      .pipe(tap(() => this.refreshTaches()));
  }

  filtrerTaches(filtres: any): Observable<TacheProduction[]> {
    let url = `${this.apiUrl}/Filtrer?`;
    const params: string[] = [];
    Object.keys(filtres).forEach(key => {
      if (filtres[key]) {
        params.push(`${key}=${filtres[key] instanceof Date ? filtres[key].toISOString() : encodeURIComponent(filtres[key])}`);
      }
    });
    url += params.join('&');
    return this.http.get<TacheProduction[]>(url);
  }

  getStatistiques(dateDebut?: Date, dateFin?: Date): Observable<any> {
    let url = `${this.apiUrl}/Statistiques`;
    const params: string[] = [];
    if (dateDebut) params.push(`dateDebut=${dateDebut.toISOString()}`);
    if (dateFin) params.push(`dateFin=${dateFin.toISOString()}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get(url);
  }

  getRapportPerformance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/RapportPerformance`);
  }
}
