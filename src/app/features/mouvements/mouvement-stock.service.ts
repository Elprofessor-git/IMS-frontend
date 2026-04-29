import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MouvementStock } from '../../shared/models/stock.model';

export interface IMouvementRequest {
  stockId: number;
  type: 'ENTREE' | 'SORTIE' | 'TRANSFERT';
  quantite: number;
  sourceEmplacementId?: number;
  destinationEmplacementId?: number;
  lotId?: string;
  motif: string;
  commandeId?: number;
  importationId?: number;
  achatId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MouvementStockService {
  private mouvementsSubject = new BehaviorSubject<MouvementStock[]>([]);
  private validationsEnAttente = new BehaviorSubject<MouvementStock[]>([]);

  constructor(private http: HttpClient) {
    this.refreshMouvements();
  }

  getMouvements(): Observable<MouvementStock[]> {
    return this.mouvementsSubject.asObservable();
  }

  getValidationsEnAttente(): Observable<MouvementStock[]> {
    return this.validationsEnAttente.asObservable();
  }

  refreshMouvements(): void {
    this.http.get<MouvementStock[]>(`${environment.apiUrl}/api/mouvements`).pipe(
      tap(mouvements => {
        this.mouvementsSubject.next(mouvements);
        this.validationsEnAttente.next(
          mouvements.filter(m => m.validationRequise && !m.valide)
        );
      })
    ).subscribe();
  }

  creerMouvement(mouvement: MouvementRequest): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(
      `${environment.apiUrl}/api/mouvements`,
      mouvement
    ).pipe(tap(() => this.refreshMouvements()));
  }

  validerMouvement(mouvementId: number, validateurId: number): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/api/mouvements/${mouvementId}/valider`,
      { validateurId }
    ).pipe(tap(() => this.refreshMouvements()));
  }

  annulerMouvement(mouvementId: number, motif: string): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/api/mouvements/${mouvementId}/annuler`,
      { motif }
    ).pipe(tap(() => this.refreshMouvements()));
  }

  getMouvementsParStock(stockId: number): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(
      `${environment.apiUrl}/api/mouvements/stock/${stockId}`
    );
  }

  getMouvementsParLot(lotId: string): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(
      `${environment.apiUrl}/api/mouvements/lot/${lotId}`
    );
  }

  getMouvementsParPeriode(debut: Date, fin: Date): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(
      `${environment.apiUrl}/api/mouvements/periode`,
      { params: { debut: debut.toISOString(), fin: fin.toISOString() } }
    );
  }

  getHistoriqueTransferts(emplacementId: number): Observable<MouvementStock[]> {
    return this.mouvementsSubject.pipe(
      map(mouvements => mouvements.filter(m => 
        m.type === 'TRANSFERT' && 
        (m.sourceEmplacementId === emplacementId || m.destinationEmplacementId === emplacementId)
      ))
    );
  }
}




// Auto-generated aliases for backward compatibility
export type MouvementRequest = IMouvementRequest;
