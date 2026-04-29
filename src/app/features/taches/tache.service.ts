import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ITache {
  id: number;
  commandeId: number;
  titre: string;
  description: string;
  statut: 'NON_COMMENCE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE';
  dateCreation: Date;
  dateDebut?: Date;
  dateFin?: Date;
  equipeId?: number;
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE';
}

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private tachesSubject = new BehaviorSubject<Tache[]>([]);

  constructor(private http: HttpClient) {
    this.refreshTaches();
  }

  getTaches(): Observable<Tache[]> {
    return this.tachesSubject.asObservable();
  }

  refreshTaches(): void {
    this.http.get<Tache[]>(`${environment.apiUrl}/api/taches`)
      .subscribe(taches => this.tachesSubject.next(taches));
  }

  creerTache(tache: Omit<Tache, 'id'>): Observable<Tache> {
    return this.http.post<Tache>(`${environment.apiUrl}/api/taches`, tache)
      .pipe(tap(() => this.refreshTaches()));
  }

  updateStatut(id: number, statut: Tache['statut']): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/taches/${id}/statut`, { statut })
      .pipe(tap(() => this.refreshTaches()));
  }

  assignerEquipe(id: number, equipeId: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/taches/${id}/equipe`, { equipeId })
      .pipe(tap(() => this.refreshTaches()));
  }

  getTachesParCommande(commandeId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${environment.apiUrl}/api/taches/commande/${commandeId}`);
  }

  genererTachesCommande(commandeId: number): Observable<Tache[]> {
    return this.http.post<Tache[]>(`${environment.apiUrl}/api/taches/generer/${commandeId}`, {})
      .pipe(tap(() => this.refreshTaches()));
  }
}




// Auto-generated aliases for backward compatibility
export type Tache = ITache;
