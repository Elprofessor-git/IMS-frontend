import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FournitureBom {
  articleId: number;
  designation: string;
  qteParPiece: number;
  unite: string;
}

export interface ModeleBom {
  id: number;
  nom: string;
  description?: string;
  fournitures: FournitureBom[];
}

@Injectable({ providedIn: 'root' })
export class ModeleBomService {
  private apiUrl = `${environment.apiUrl}/ModeleBom`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ModeleBom[]> {
    return this.http.get<ModeleBom[]>(this.apiUrl);
  }

  getById(id: number): Observable<ModeleBom> {
    return this.http.get<ModeleBom>(`${this.apiUrl}/${id}`);
  }

  create(bom: Partial<ModeleBom>): Observable<ModeleBom> {
    return this.http.post<ModeleBom>(this.apiUrl, bom);
  }

  update(id: number, bom: Partial<ModeleBom>): Observable<ModeleBom> {
    return this.http.put<ModeleBom>(`${this.apiUrl}/${id}`, bom);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
