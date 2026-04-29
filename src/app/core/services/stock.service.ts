import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

// --- New Interfaces Matching Backend Models ---

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

export enum TypeStock {
  Libre,
  Reserve,
  Importe
}

export interface IStock {
  id: number;
  articleId: number;
  couleur?: string;
  taille?: string;
  emplacementPhysique?: string;
  numeroLot?: string;
  quantite: number;
  quantiteReservee: number;
  typeStock: TypeStock;
  prixUnitaire: number;
  dateEntree: Date;
  estValide: boolean;
  article?: IArticle; // Included in GET responses
}

export type Stock = IStock;

export enum TypeMouvement {
    Entree,
    Sortie,
    Transfert,
    Ajustement,
    Reservation,
    Liberation
}

export enum OrigineMouvement {
    Achat,
    Vente,
    Production,
    Transfert,
    Ajustement,
    Inventaire
}

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

// --- Refactored Service ---

@Injectable({
  providedIn: 'root'
})
export class StockService extends BaseApiService<Stock> {
  protected override endpoint = 'Stock'; // Override endpoint to match controller

  constructor(http: HttpClient) {
    super(http);
  }

  // Get all stock items
  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}`)
      .pipe(retry(2), catchError(this.handleError));
  }

  // Get libre stock
  getStocksLibres(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/Libre`)
      .pipe(retry(2), catchError(this.handleError));
  }

  // Get reservé stock
  getStocksReserves(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/Reserve`)
      .pipe(retry(2), catchError(this.handleError));
  }

  // Get alertes
  getStocksAlertes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Alertes`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get a single stock item by ID
  getStockById(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create a new stock item
  createStock(stock: Partial<Stock>): Observable<Stock> {
    return this.http.post<Stock>(`${this.apiUrl}`, stock)
      .pipe(catchError(this.handleError));
  }

  // Update a stock item
  updateStock(id: number, stock: Partial<Stock>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, stock)
      .pipe(catchError(this.handleError));
  }

  // Delete a stock item
  deleteStock(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Valider un stock (validation manuelle)
  validerStock(id: number, validePar: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/Valider`, validePar)
      .pipe(catchError(this.handleError));
  }

  // Réserver une quantité sur un stock
  reserverStock(id: number, quantite: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/Reserver`, quantite)
      .pipe(catchError(this.handleError));
  }

  // Create a stock movement for adjustment
  createMouvement(mouvement: Partial<MouvementStock>): Observable<MouvementStock> {
      return this.http.post<MouvementStock>(`${this.apiUrl}/MouvementStock`, mouvement)
        .pipe(catchError(this.handleError));
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
}


