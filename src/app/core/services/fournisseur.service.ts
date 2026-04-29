import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { Fournisseur } from '../../shared/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class FournisseurService extends BaseApiService<Fournisseur> {
  protected endpoint = 'fournisseurs';

  getActiveFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<{ data: Fournisseur[] }>(`${this.apiUrl}/active`)
      .pipe(map(response => response.data));
  }

  searchFournisseurs(searchTerm: string): Observable<Fournisseur[]> {
    return this.http.get<{ data: Fournisseur[] }>(`${this.apiUrl}/search`, {
      params: { searchTerm }
    }).pipe(map(response => response.data));
  }

  getFournisseurStats(fournisseurId: number): Observable<any> {
    return this.http.get<{ data: any }>(`${this.apiUrl}/${fournisseurId}/stats`)
      .pipe(map(response => response.data));
  }

  validateFournisseur(fournisseurId: number): Observable<boolean> {
    return this.http.post<{ data: boolean }>(`${this.apiUrl}/${fournisseurId}/validate`, {})
      .pipe(map(response => response.data));
  }
}


