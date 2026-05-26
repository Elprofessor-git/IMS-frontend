import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseApiService } from '../../core/services/base-api.service';
import { CommandeClient, BesoinCommande } from '../../shared/models/commande.model';


export interface ConfigTaille {
  id?: number;
  commandeId?: number;
  taille: string;
  quantite: number;
}

export interface BomLigne {
  id?: number;
  commandeId?: number;
  articleId: number;
  article?: any;
  quantiteParPiece: number;
  unite?: string;
}

export interface ResultatCalcul {
  id?: number;
  commandeId?: number;
  articleId: number;
  article?: any;
  besoinBrut: number;
  margeAppliquee: number;
  besoinFinal: number;
  qteAchat: number;
  qteImport: number;
  qteStockReserve: number;
  qteDisponible: number;
  manque: number;
  estSuffisant: boolean;
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

  updateCommande(id: number, commande: any): Observable<CommandeClient> {
    return this.http.put<CommandeClient>(`${this.apiUrl}/${id}`, commande)
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

  getTailles(commandeId: number): Observable<ConfigTaille[]> {
    return this.http.get<ConfigTaille[]>(`${this.apiUrl}/${commandeId}/Tailles`);
  }

  setTailles(commandeId: number, tailles: ConfigTaille[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${commandeId}/Tailles`, tailles);
  }

  getBom(commandeId: number): Observable<BomLigne[]> {
    return this.http.get<BomLigne[]>(`${this.apiUrl}/${commandeId}/Bom`);
  }

  setBom(commandeId: number, bom: BomLigne[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${commandeId}/Bom`, bom);
  }

  calculer(commandeId: number, margeAppliquee: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${commandeId}/Calculer`, { margeAppliquee });
  }

  getResultatCalcul(commandeId: number): Observable<ResultatCalcul[]> {
    return this.http.get<ResultatCalcul[]>(`${this.apiUrl}/${commandeId}/ResultatCalcul`);
  }

}
