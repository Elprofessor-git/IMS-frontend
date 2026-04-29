import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { Client } from '../../shared/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService extends BaseApiService<Client> {
  protected endpoint = 'clients';

  getActiveClients(): Observable<Client[]> {
    return this.http.get<{ data: Client[] }>(`${this.apiUrl}/active`)
      .pipe(map((response: any) => response.data));
  }

  searchClients(searchTerm: string): Observable<Client[]> {
    return this.http.get<{ data: Client[] }>(`${this.apiUrl}/search`, {
      params: { searchTerm }
    }).pipe(map((response: any) => response.data));
  }

  getClientHistory(clientId: number): Observable<any[]> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/${clientId}/history`)
      .pipe(map((response: any) => response.data));
  }

  updatePreferences(clientId: number, preferences: string): Observable<Client> {
    return this.http.patch<{ data: Client }>(`${this.apiUrl}/${clientId}/preferences`, { preferences })
      .pipe(map((response: any) => response.data));
  }
}


