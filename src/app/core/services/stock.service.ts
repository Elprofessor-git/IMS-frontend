import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap, retry, finalize } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

export interface Article {
  id: number;
  nom: string;
  reference: string;
  codeBarres?: string;
  description?: string;
  categorie: string;
  prix: number;
  unite: string;
  seuilMinimum: number;
  seuilMaximum?: number;
  quantite: number;
  emplacement?: string;
  imageUrl?: string;
  dateCreation: Date;
  dateModification: Date;
  actif: boolean;
}

export interface StockSummary {
  totalArticles: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
  categories: string[];
}

export interface StockFilters {
  search?: string;
  category?: string;
  minStock?: number;
  maxStock?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: 'active' | 'low' | 'out';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StockMovement {
  id: number;
  articleId: number;
  type: 'entree' | 'sortie' | 'ajustement';
  quantite: number;
  motif: string;
  date: Date;
  utilisateurId: number;
}

@Injectable({
  providedIn: 'root'
})
export class StockService extends BaseApiService<Article> {
  protected endpoint = 'stock';
  
  private articlesSubject = new BehaviorSubject<Article[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  public articles$ = this.articlesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(http: HttpClient) {
    super(http);
  }

  // CRUD Operations
  getArticles(filters?: StockFilters, page: number = 1, pageSize: number = 25): Observable<PaginatedResponse<Article>> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Article>>(`${this.apiUrl}/article`, { params })
      .pipe(
        retry(2),
        tap(response => {
          this.articlesSubject.next(response.data);
        }),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  getArticleById(id: number): Observable<Article> {
    this.loadingSubject.next(true);
    
    return this.http.get<Article>(`${this.apiUrl}/article/${id}`)
      .pipe(
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  createArticle(article: Partial<Article>): Observable<Article> {
    this.loadingSubject.next(true);
    
    return this.http.post<Article>(`${this.apiUrl}/article`, article)
      .pipe(
        tap(() => this.refreshArticles()),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  updateArticle(id: number, article: Partial<Article>): Observable<Article> {
    this.loadingSubject.next(true);
    
    return this.http.put<Article>(`${this.apiUrl}/article/${id}`, article)
      .pipe(
        tap(() => this.refreshArticles()),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  deleteArticle(id: number): Observable<void> {
    this.loadingSubject.next(true);
    
    return this.http.delete<void>(`${this.apiUrl}/article/${id}`)
      .pipe(
        tap(() => this.refreshArticles()),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  bulkDelete(ids: number[]): Observable<void> {
    this.loadingSubject.next(true);
    
    return this.http.post<void>(`${this.apiUrl}/article/bulk-delete`, { ids })
      .pipe(
        tap(() => this.refreshArticles()),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  // Stock Management
  adjustStock(articleId: number, quantite: number, motif: string): Observable<StockMovement> {
    this.loadingSubject.next(true);
    
    const movement = {
      articleId,
      type: 'ajustement' as const,
      quantite,
      motif
    };
    
    return this.http.post<StockMovement>(`${this.apiUrl}/stock/mouvement`, movement)
      .pipe(
        tap(() => this.refreshArticles()),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  getStockMovements(articleId?: number, page: number = 1, pageSize: number = 25): Observable<PaginatedResponse<StockMovement>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (articleId) {
      params = params.set('articleId', articleId.toString());
    }
    
    return this.http.get<PaginatedResponse<StockMovement>>(`${this.apiUrl}/stock/mouvements`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Analytics
  getStockSummary(): Observable<StockSummary> {
    return this.http.get<StockSummary>(`${this.apiUrl}/stock/summary`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getLowStockArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/stock/low-stock`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getOutOfStockArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/stock/out-of-stock`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Import/Export
  exportArticles(filters?: StockFilters): Observable<Blob> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    
    return this.http.get(`${this.apiUrl}/article/export`, { 
      params, 
      responseType: 'blob' 
    }).pipe(catchError(this.handleError.bind(this)));
  }

  importArticles(file: File): Observable<{ success: number; errors: string[] }> {
    this.loadingSubject.next(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{ success: number; errors: string[] }>(`${this.apiUrl}/article/import`, formData)
      .pipe(
        tap(() => this.refreshArticles()),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  // Utility methods
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/article/categories`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  searchArticles(term: string): Observable<Article[]> {
    if (!term.trim()) {
      return new Observable(observer => observer.next([]));
    }
    
    const params = new HttpParams().set('search', term);
    
    return this.http.get<Article[]>(`${this.apiUrl}/article/search`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  private refreshArticles(): void {
    // Refresh current data without changing loading state
    this.getArticles().subscribe();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Données invalides';
          break;
        case 401:
          errorMessage = 'Non autorisé';
          break;
        case 403:
          errorMessage = 'Accès interdit';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }
    
    this.errorSubject.next(errorMessage);
    console.error('Stock Service Error:', error);
    
    return throwError(() => new Error(errorMessage));
  }

  // Clear error state
  clearError(): void {
    this.errorSubject.next(null);
  }
}
