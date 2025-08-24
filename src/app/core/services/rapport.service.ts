import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

// Define the structure of the statistics object returned by the backend
export interface MouvementStatistiques {
  totalMouvements: number;
  entrees: number;
  sorties: number;
  transferts: number;
  ajustements: number;
  quantiteTotaleEntree: number;
  quantiteTotaleSortie: number;
  mouvementsParJour: { date: Date; nombre: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class RapportService extends BaseApiService<any> {
  protected override endpoint = 'MouvementStock';

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Fetches movement statistics from the backend.
   * @param dateDebut Optional start date for the statistics period.
   * @param dateFin Optional end date for the statistics period.
   */
  getStatistiquesMouvements(dateDebut?: Date, dateFin?: Date): Observable<MouvementStatistiques> {
    let params = new HttpParams();
    if (dateDebut) {
      params = params.set('dateDebut', dateDebut.toISOString());
    }
    if (dateFin) {
      params = params.set('dateFin', dateFin.toISOString());
    }

    return this.http.get<MouvementStatistiques>(`${this.apiUrl}/${this.endpoint}/Statistiques`, { params })
      .pipe(
        catchError((error) => {
          console.error('Erreur lors de la récupération des statistiques de mouvements', error);
          throw error;
        })
      );
  }

    // TODO: Implement methods for other report types (ventes, analytics)
    // For example:
    // getRapportVentes(): Observable<any> { ... }
    // getAnalyticsData(): Observable<any> { ... }
}
