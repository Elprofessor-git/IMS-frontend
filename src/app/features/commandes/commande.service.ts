import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ICommandeClient {
  id: number;
  clientId: number;
  reference: string;
  dateCommande: Date;
  statut: 'EN_ATTENTE' | 'PRETE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  lignesCommande: LigneCommande[];
}

export interface ILigneCommande {
  id: number;
  commandeId: number;
  articleId: number;
  quantite: number;
  prixUnitaire: number;
  statut: 'EN_ATTENTE' | 'STOCK_RESERVE' | 'EN_PRODUCTION';
}

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private commandesSubject = new BehaviorSubject<CommandeClient[]>([]);

  constructor(private http: HttpClient) {
    this.refreshCommandes();
  }

  getCommandes(): Observable<CommandeClient[]> {
    return this.commandesSubject.asObservable();
  }

  refreshCommandes(): void {
    this.http.get<CommandeClient[]>(`${environment.apiUrl}/api/commandes`)
      .subscribe(commandes => this.commandesSubject.next(commandes));
  }

  createCommande(commande: Omit<CommandeClient, 'id'>): Observable<CommandeClient> {
    return this.http.post<CommandeClient>(`${environment.apiUrl}/api/commandes`, commande)
      .pipe(tap(() => this.refreshCommandes()));
  }

  updateStatutCommande(id: number, statut: CommandeClient['statut']): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/commandes/${id}/statut`, { statut })
      .pipe(tap(() => this.refreshCommandes()));
  }

  verifierDisponibiliteStock(commande: Partial<CommandeClient>): Observable<boolean> {
    return this.http.post<boolean>(`${environment.apiUrl}/api/commandes/verifier-stock`, commande);
  }

  reserverStock(commandeId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/commandes/${commandeId}/reserver-stock`, {})
      .pipe(tap(() => this.refreshCommandes()));
  }
}




// Auto-generated aliases for backward compatibility
export type CommandeClient = ICommandeClient;
export type LigneCommande = ILigneCommande;
