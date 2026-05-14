import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Fournisseur } from '../../shared/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class FournisseurService extends BaseApiService<Fournisseur> {
  protected endpoint = 'Fournisseur';

  searchFournisseurs(searchTerm: string): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${this.apiUrl}/Search/${encodeURIComponent(searchTerm)}`);
  }

  getFournisseurHistorique(fournisseurId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${fournisseurId}/Historique`);
  }
}
