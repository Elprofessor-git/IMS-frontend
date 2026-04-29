import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Stock } from '../../shared/models/stock.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private stocksSubject = new BehaviorSubject<Stock[]>([]);
  private alertThresholdReached = new BehaviorSubject<{articleId: number, quantity: number}[]>([]);

  constructor(private http: HttpClient) {
    this.refreshStocks();
  }

  getStocks(): Observable<Stock[]> {
    return this.stocksSubject.asObservable();
  }

  getAlertThresholds(): Observable<{articleId: number, quantity: number}[]> {
    return this.alertThresholdReached.asObservable();
  }

  refreshStocks(): void {
    this.http.get<Stock[]>(`${environment.apiUrl}/api/stock`).pipe(
      tap(stocks => {
        this.stocksSubject.next(stocks);
        this.checkAlertThresholds(stocks);
      })
    ).subscribe();
  }

  updateStock(id: number, stock: Partial<Stock>): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/stock/${id}`, stock).pipe(
      tap(() => this.refreshStocks())
    );
  }

  reserveStock(articleId: number, quantity: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/stock/reserve`, { articleId, quantity }).pipe(
      tap(() => this.refreshStocks())
    );
  }

  releaseStock(articleId: number, quantity: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/stock/release`, { articleId, quantity }).pipe(
      tap(() => this.refreshStocks())
    );
  }

  private checkAlertThresholds(stocks: Stock[]): void {
    const alerts = stocks.filter(stock => stock.quantiteLibre <= stock.seuilAlerte)
      .map(stock => ({
        articleId: stock.articleId,
        quantity: stock.quantiteLibre
      }));
    this.alertThresholdReached.next(alerts);
  }
}


