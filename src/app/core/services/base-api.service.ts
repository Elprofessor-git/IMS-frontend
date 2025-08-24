import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PaginatedResponse, PagedRequest } from '../../shared/models/common.model';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService<T> {
  protected abstract endpoint: string;

  constructor(protected http: HttpClient) {}

  protected get apiUrl(): string {
    return `${environment.apiUrl}/${this.endpoint}`;
  }

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.apiUrl);
  }

  getPaged(request: PagedRequest): Observable<PaginatedResponse<T>> {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    if (request.searchTerm) {
      params = params.set('searchTerm', request.searchTerm);
    }

    if (request.sortBy) {
      params = params.set('sortBy', request.sortBy);
    }

    if (request.sortDirection) {
      params = params.set('sortDirection', request.sortDirection);
    }

    if (request.filters) {
      Object.keys(request.filters).forEach(key => {
        if (request.filters![key] !== null && request.filters![key] !== undefined) {
          params = params.set(key, request.filters![key].toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<T>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${id}`);
  }

  create(entity: Partial<T>): Observable<T> {
    return this.http.post<T>(this.apiUrl, entity);
  }

  update(id: number, entity: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${id}`, entity);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
