import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseApiService } from '../../core/services/base-api.service';
import { CommandeClient, BesoinCommande } from '../../shared/models/commande.model';

export interface ICommandeClient {
  id: number;
  clientId: number;
  reference: string;
  dateCommande: Date;
  statut: 'EN_ATTENTE' | 'PRETE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE' | any;
  lignesCommande: ILigneCommande[];
}

export interface ILigneCommande {
  id: number;
  commandeId: number;
  articleId: number;
  quantite: number;
  prixUnitaire: number;
  statut: 'EN_ATTENTE' | 'STOCK_RESERVE' | 'EN_PRODUCTION' | any;
}

@Injectable({
  providedIn: 'root'
})
export class CommandeService extends BaseApiService<CommandeClient> {
  protected override endpoint = 'CommandeClient';

  private commandesSubject = new BehaviorSubject<CommandeClient[]>([]);

  constructor(http: HttpClient) {
    super(http);
    this.refreshCommandes();
  }

  // --- Méthodes réactives (issues des features) ---
  getCommandesObservable(): Observable<CommandeClient[]> {
    return this.commandesSubject.asObservable();
  }

  refreshCommandes(): void {
    this.http.get<CommandeClient[]>(`${this.apiUrl}`)
      .subscribe({
        next: (commandes) => this.commandesSubject.next(commandes),
        error: () => { /* ignorer silencieusement */ }
      });
  }

  createCommande(commande: any): Observable<CommandeClient> {
    return this.http.post<CommandeClient>(`${this.apiUrl}`, commande)
      .pipe(tap(() => this.refreshCommandes()));
  }

  updateStatutCommande(id: number, statut: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/statut`, { statut })
      .pipe(tap(() => this.refreshCommandes()));
  }

  verifierDisponibiliteStock(commande: any): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/verifier-stock`, commande);
  }

  reserverStock(commandeId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${commandeId}/reserver-stock`, {})
      .pipe(tap(() => this.refreshCommandes()));
  }

  // --- Méthodes synchrones (issues du core) ---
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
    return this.http.post(`${this.apiUrl}/${id}/ChangerStatut`, { statut: nouveauStatut })
      .pipe(tap(() => this.refreshCommandes()));
  }

  calculerBesoins(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/CalculerBesoins`, {});
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Dashboard`);
  }

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

  filtrerCommandes(filtres: any): Observable<CommandeClient[]> {
    let url = `${this.apiUrl}/Filtrer?`;
    const params: string[] = [];
    Object.keys(filtres).forEach(key => {
      if (filtres[key]) {
        params.push(`${key}=${filtres[key] instanceof Date ? filtres[key].toISOString() : encodeURIComponent(filtres[key])}`);
      }
    });
    url += params.join('&');
    return this.http.get<CommandeClient[]>(url);
  }
}
