import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../core/services/base-api.service';

export interface Marque {
  id: number;
  nom: string;
  plateformeId: number;
  description?: string;
  estActive: boolean;
  dateCreation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarqueService extends BaseApiService<Marque> {
  protected override endpoint = 'Marque';

  constructor(http: HttpClient) {
    super(http);
  }

  getByPlateforme(plateformeId: number): Observable<Marque[]> {
    return this.http.get<Marque[]>(`${this.apiUrl}?plateformeId=${plateformeId}`);
  }
}
