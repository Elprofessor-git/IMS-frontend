import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Client } from '../../shared/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService extends BaseApiService<Client> {
  protected endpoint = 'Client';

  searchClients(searchTerm: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/Search/${encodeURIComponent(searchTerm)}`);
  }

  getClientHistory(clientId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${clientId}/Historique`);
  }
}
