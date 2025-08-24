import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Plateforme } from '../../shared/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PlateformeService extends BaseApiService<Plateforme> {
  protected endpoint = 'Plateforme';

  constructor(http: HttpClient) {
    super(http);
  }

  // Méthodes spécifiques aux plateformes
  getActives(): Observable<Plateforme[]> {
    return this.http.get<Plateforme[]>(`${this.apiUrl}/Actives`);
  }

  activerPlateforme(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Activer`, {});
  }

  desactiverPlateforme(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/Desactiver`, {});
  }
}
