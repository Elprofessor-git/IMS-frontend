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

  // --- Méthodes synchrones (issues du core) ---
  getByStatut(statut: string): Observable<CommandeClient[]> {
    return this.http.get<CommandeClient[]>(`${this.apiUrl}/Statut/${statut}`);
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

  ajouterBesoin(commandeId: number, besoin: Partial<BesoinCommande>): Observable<BesoinCommande> {
    return this.http.post<BesoinCommande>(`${this.apiUrl}/${commandeId}/Besoins`, besoin);
  }

  modifierBesoin(commandeId: number, besoinId: number, besoin: Partial<BesoinCommande>): Observable<BesoinCommande> {
    return this.http.put<BesoinCommande>(`${this.apiUrl}/${commandeId}/Besoins/${besoinId}`, besoin);
  }

  supprimerBesoin(commandeId: number, besoinId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commandeId}/Besoins/${besoinId}`);
  }

}
