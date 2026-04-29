import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { BaseApiService } from '../../core/services/base-api.service';

// --- Interfaces Matching Backend Models (issues du core) ---

export interface IArticle {
  id: number;
  designation: string;
  description?: string;
  categorie?: string;
  unite?: string;
  reference?: string;
  prixUnitaireMoyen: number;
  estActif: boolean;
  seuilAlerte?: number;
}
export type Article = IArticle;

export enum TypeStock { Libre, Reserve, Importe }

export interface IStock {
  id: number;
  articleId: number;
  couleur?: string;
  taille?: string;
  emplacementPhysique?: string;
  numeroLot?: string;
  quantite: number;
  quantiteReservee: number;
  quantiteLibre?: number; // Ajouté pour checkAlertThresholds()
  typeStock: TypeStock;
  prixUnitaire: number;
  dateEntree: Date;
  estValide: boolean;
  seuilAlerte?: number; // Ajouté pour checkAlertThresholds()
  article?: IArticle;
}
export type Stock = IStock;

export enum TypeMouvement { Entree, Sortie, Transfert, Ajustement, Reservation, Liberation }
export enum OrigineMouvement { Achat, Vente, Production, Transfert, Ajustement, Inventaire }

export interface IMouvementStock {
    id: number;
    stockId: number;
    typeMouvement: TypeMouvement;
    origineMouvement: OrigineMouvement;
    quantite: number;
    dateMouvement: Date;
    motif?: string;
    effectuePar?: string;
}
export type MouvementStock = IMouvementStock;

@Injectable({
  providedIn: 'root'
})
export class StockService extends BaseApiService<Stock> {
  protected override endpoint = 'Stock'; 

  // --- Attributs réactifs (issus des features) ---
  private stocksSubject = new BehaviorSubject<Stock[]>([]);
  private alertThresholdReached = new BehaviorSubject<{articleId: number, quantity: number}[]>([]);

  constructor(http: HttpClient) {
    super(http);
    this.refreshStocks(); // Initialisation réactive
  }

  // --- Méthodes synchrones API (issues du core) ---

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}`)
      .pipe(retry(2), catchError(this.handleError));
  }

  getStocksLibres(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/Libre`)
      .pipe(retry(2), catchError(this.handleError));
  }

  getStocksReserves(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/Reserve`)
      .pipe(retry(2), catchError(this.handleError));
  }

  getStocksAlertes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Alertes`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getStockById(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createStock(stock: Partial<Stock>): Observable<Stock> {
    return this.http.post<Stock>(`${this.apiUrl}`, stock).pipe(
      tap(() => this.refreshStocks()), // Actualisation du subject
      catchError(this.handleError)
    );
  }

  updateStock(id: number, stock: Partial<Stock>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, stock).pipe(
      tap(() => this.refreshStocks()), // Actualisation du subject
      catchError(this.handleError)
    );
  }

  deleteStock(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshStocks()), // Actualisation du subject
      catchError(this.handleError)
    );
  }

  validerStock(id: number, validePar: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/Valider`, validePar)
      .pipe(catchError(this.handleError));
  }

  reserverStock(id: number, quantite: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/Reserver`, quantite).pipe(
      tap(() => this.refreshStocks()),
      catchError(this.handleError)
    );
  }

  createMouvement(mouvement: Partial<MouvementStock>): Observable<MouvementStock> {
      return this.http.post<MouvementStock>(`${this.apiUrl}/MouvementStock`, mouvement).pipe(
        tap(() => this.refreshStocks()),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Erreur ${error.status}: ${error.message}`;
    }
    console.error('Stock Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // --- Méthodes réactives et additionnelles (issues des features) ---

  // Renommé pour ne pas confliter avec le getStocks() du core qui retourne l'appel HTTP brut
  getStocksObservable(): Observable<Stock[]> {
    return this.stocksSubject.asObservable();
  }

  getAlertThresholds(): Observable<{articleId: number, quantity: number}[]> {
    return this.alertThresholdReached.asObservable();
  }

  refreshStocks(): void {
    this.http.get<Stock[]>(`${this.apiUrl}`).pipe(
      tap(stocks => {
        this.stocksSubject.next(stocks);
        this.checkAlertThresholds(stocks);
      }),
      catchError(() => { return []; }) // Ignorer silencieusement si l'API n'est pas dispo
    ).subscribe();
  }

  reserveStock(articleId: number, quantity: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reserve`, { articleId, quantity }).pipe(
      tap(() => this.refreshStocks())
    );
  }

  releaseStock(articleId: number, quantity: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/release`, { articleId, quantity }).pipe(
      tap(() => this.refreshStocks())
    );
  }

  private checkAlertThresholds(stocks: Stock[]): void {
    const alerts = stocks.filter(stock => (stock.quantiteLibre || stock.quantite) <= (stock.seuilAlerte || 0))
      .map(stock => ({
        articleId: stock.articleId,
        quantity: stock.quantiteLibre || stock.quantite
      }));
    this.alertThresholdReached.next(alerts);
  }
}
