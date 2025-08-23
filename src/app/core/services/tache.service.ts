import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { TacheProduction } from '../../shared/models/tache.model';

@Injectable({
  providedIn: 'root'
})
export class TacheService extends BaseApiService<TacheProduction> {
  protected endpoint = 'TacheProduction';

  constructor(http: HttpClient) {
    super(http);
  }

  // Méthodes spécifiques aux tâches
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
    return this.http.post(`${this.apiUrl}/${id}/Commencer`, { assigneA });
  }

  mettreAJourAvancement(id: number, pourcentage: number, commentaire?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/MettreAJourAvancement`, { 
      pourcentage, 
      commentaire 
    });
  }

  terminerTache(id: number, commentaireFinal?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Terminer`, { commentaireFinal });
  }

  bloquerTache(id: number, motifBlocage: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Bloquer`, { motifBlocage });
  }

  debloquerTache(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Debloquer`, {});
  }

  assignerTache(id: number, assigneA: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Assigner`, { assigneA });
  }

  modifierPriorite(id: number, nouvellePriorite: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ModifierPriorite`, { priorite: nouvellePriorite });
  }

  modifierEcheance(id: number, nouvelleEcheance: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ModifierEcheance`, { 
      dateFinPrevue: nouvelleEcheance.toISOString() 
    });
  }

  // Filtrage avancé
  filtrerTaches(filtres: any): Observable<TacheProduction[]> {
    let url = `${this.apiUrl}/Filtrer?`;
    const params: string[] = [];
    
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        if (filtres[key] instanceof Date) {
          params.push(`${key}=${filtres[key].toISOString()}`);
        } else {
          params.push(`${key}=${encodeURIComponent(filtres[key])}`);
        }
      }
    });
    
    url += params.join('&');
    return this.http.get<TacheProduction[]>(url);
  }

  // Statistiques et rapports
  getStatistiques(dateDebut?: Date, dateFin?: Date): Observable<any> {
    let url = `${this.apiUrl}/Statistiques`;
    const params: string[] = [];
    
    if (dateDebut) {
      params.push(`dateDebut=${dateDebut.toISOString()}`);
    }
    if (dateFin) {
      params.push(`dateFin=${dateFin.toISOString()}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get(url);
  }

  getRapportPerformance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/RapportPerformance`);
  }
}

