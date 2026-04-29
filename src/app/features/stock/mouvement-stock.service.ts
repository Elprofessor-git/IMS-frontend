import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IMouvementStock {
  id: number;
  stockId: number;
  type: 'ENTREE' | 'SORTIE' | 'TRANSFERT';
  quantite: number;
  dateOperation: Date;
  motif: string;
  utilisateurId: number;
  sourceId?: number;
  destinationId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MouvementStockService {
  private mouvementsSubject = new BehaviorSubject<MouvementStock[]>([]);

  constructor(private http: HttpClient) {
    this.refreshMouvements();
  }

  getMouvements(): Observable<MouvementStock[]> {
    return this.mouvementsSubject.asObservable();
  }

  refreshMouvements(): void {
    this.http.get<MouvementStock[]>(`${environment.apiUrl}/api/mouvementStock`)
      .subscribe(mouvements => this.mouvementsSubject.next(mouvements));
  }

  createMouvement(mouvement: Omit<MouvementStock, 'id'>): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(`${environment.apiUrl}/api/mouvementStock`, mouvement)
      .pipe(tap(() => this.refreshMouvements()));
  }

  getMouvementsByStock(stockId: number): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${environment.apiUrl}/api/mouvementStock/stock/${stockId}`);
  }
}




// Auto-generated aliases for backward compatibility
export type MouvementStock = IMouvementStock;
