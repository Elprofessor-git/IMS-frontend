import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { CommandeClient, BesoinCommande } from '../../shared/models/commande.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommandeService extends BaseApiService<CommandeClient> {
  protected endpoint = 'CommandeClient';

  constructor(http: HttpClient) {
    super(http);
  }

  // Méthodes spécifiques aux commandes
  getByStatut(statut: string): Observable<CommandeClient[]> {
    return this.http.get<CommandeClient[]>(`${this.apiUrl}/Statut/${statut}`);
  }

  getByClient(clientId: number): Observable<CommandeClient[]> {
    return this.http.get<CommandeClient[]>(`${this.apiUrl}/ByClient/${clientId}`);
  }

  getByPlateforme(plateformeId: number): Observable<CommandeClient[]> {
    return this.http.get<CommandeClient[]>(`${this.apiUrl}/ByPlateforme/${plateformeId}`);
  }

  validerRessources(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ValiderRessources`, {});
  }

  genererTaches(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/GenererTaches`, {});
  }

  changerStatut(id: number, nouveauStatut: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ChangerStatut`, { statut: nouveauStatut });
  }

  calculerBesoins(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/CalculerBesoins`, {});
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Dashboard`);
  }

  // Gestion des besoins de commande
  getBesoins(commandeId: number): Observable<BesoinCommande[]> {
    return this.http.get<BesoinCommande[]>(`${this.apiUrl}/${commandeId}/Besoins`);
  }

  ajouterBesoin(commandeId: number, besoin: Partial<BesoinCommande>): Observable<BesoinCommande> {
    return this.http.post<BesoinCommande>(`${this.apiUrl}/${commandeId}/Besoins`, besoin);
  }

  modifierBesoin(commandeId: number, besoinId: number, besoin: Partial<BesoinCommande>): Observable<BesoinCommande> {
    return this.http.put<BesoinCommande>(`${this.apiUrl}/${commandeId}/Besoins/${besoinId}`, besoin);
  }

  supprimerBesoin(commandeId: number, besoinId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commandeId}/Besoins/${besoinId}`);
  }

  // Filtrage avancé
  filtrerCommandes(filtres: any): Observable<CommandeClient[]> {
    let url = `${this.apiUrl}/Filtrer?`;
    const params: string[] = [];

    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        if (filtres[key] instanceof Date) {
          params.push(`${key}=${filtres[key].toISOString()}`);
        } else {
          params.push(`${key}=${encodeURIComponent(filtres[key])}`);
        }
      }
    });

    url += params.join('&');
    return this.http.get<CommandeClient[]>(url);
  }
}


