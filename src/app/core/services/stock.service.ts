import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

// --- New Interfaces Matching Backend Models ---

export interface Article {
  id: number;
  designation: string;
  description?: string;
  categorie?: string;
  unite?: string;
  reference?: string;
  prixUnitaireMoyen: number;
  estActif: boolean;
}

export enum TypeStock {
  Libre,
  Reserve,
  Importe
}

export interface Stock {
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
  article?: Article; // Included in GET responses
}

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

export interface MouvementStock {
    id: number;
    stockId: number;
    typeMouvement: TypeMouvement;
    origineMouvement: OrigineMouvement;
    quantite: number;
    dateMouvement: Date;
    motif?: string;
    effectuePar?: string;
}

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
  getStocks(filters?: any): Observable<Stock[]> {
    // The backend GET /api/Stock doesn't seem to have pagination/filtering in the controller code.
    // Implementing a simple GET all for now.
    return this.http.get<Stock[]>(`${this.apiUrl}/${this.endpoint}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // Get a single stock item by ID
  getStockById(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/${this.endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create a new stock item
  createStock(stock: Partial<Stock>): Observable<Stock> {
    return this.http.post<Stock>(`${this.apiUrl}/${this.endpoint}`, stock)
      .pipe(catchError(this.handleError));
  }

  // Update a stock item
  updateStock(id: number, stock: Partial<Stock>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${this.endpoint}/${id}`, stock)
      .pipe(catchError(this.handleError));
  }

  // Delete a stock item
  deleteStock(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${this.endpoint}/${id}`)
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
