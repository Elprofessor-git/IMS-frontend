import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Article } from '../../shared/models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService extends BaseApiService<Article> {
  protected endpoint = 'Article';

  constructor(http: HttpClient) {
    super(http);
  }

  // Méthodes spécifiques aux articles
  search(terme: string): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/Search/${encodeURIComponent(terme)}`);
  }

  getByCategorie(categorie: string): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/ByCategorie/${encodeURIComponent(categorie)}`);
  }

  getStockTotal(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/StockTotal`);
  }

  activerArticle(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Activer`, {});
  }

  desactiverArticle(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Desactiver`, {});
  }

  uploadImage(id: number, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/${id}/image`, formData);
  }

  // Catégories
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/Categories`);
  }

  getSousCategories(categorie: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/SousCategories/${encodeURIComponent(categorie)}`);
  }
}
