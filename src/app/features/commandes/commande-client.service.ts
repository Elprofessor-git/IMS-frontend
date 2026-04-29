import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ICommandeClient {
  id: number;
  reference: string;
  clientId: number;
  plateformeId: number;
  dateCreation: Date;
  dateModification: Date;
  statut: 'EN_ATTENTE' | 'PRETE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  specifications: {
    article: {
      id: number;
      quantite: number;
      taille: string;
      besoinUnitaire: number;
    }[];
  };
  ressources: {
    stockImporte: {
      articleId: number;
      quantite: number;
    }[];
    achatsLocaux: {
      articleId: number;
      quantite: number;
      achatId: number;
    }[];
    stockLibre: {
      articleId: number;
      quantite: number;
      stockId: number;
    }[];
  };
  validation: {
    stockImporteValide: boolean;
    achatsLocauxValides: boolean;
    stockLibreValide: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CommandeClientService {
  private commandesSubject = new BehaviorSubject<CommandeClient[]>([]);

  constructor(private http: HttpClient) {
    this.refreshCommandes();
  }

  getCommandes(): Observable<CommandeClient[]> {
    return this.commandesSubject.asObservable();
  }

  getCommandesPretes(): Observable<CommandeClient[]> {
    return this.commandesSubject.pipe(
      map(commandes => commandes.filter(c => c.statut === 'PRETE'))
    );
  }

  refreshCommandes(): void {
    this.http.get<CommandeClient[]>(`${environment.apiUrl}/api/commandes`)
      .subscribe(commandes => this.commandesSubject.next(commandes));
  }

  creerCommande(commande: Omit<CommandeClient, 'id'>): Observable<CommandeClient> {
    return this.http.post<CommandeClient>(
      `${environment.apiUrl}/api/commandes`,
      commande
    ).pipe(tap(() => this.refreshCommandes()));
  }

  calculerBesoins(commandeId: number): Observable<{
    articleId: number;
    quantiteTotale: number;
    unite: string;
  }[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/api/commandes/${commandeId}/besoins`
    );
  }

  validerRessources(commandeId: number, type: 'stockImporte' | 'achatsLocaux' | 'stockLibre'): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/api/commandes/${commandeId}/valider-ressources`,
      { type }
    ).pipe(tap(() => this.refreshCommandes()));
  }

  affecterStockImporte(commandeId: number, affectations: {
    articleId: number;
    quantite: number;
    importationId: number;
  }[]): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/api/commandes/${commandeId}/affecter-stock-importe`,
      { affectations }
    ).pipe(tap(() => this.refreshCommandes()));
  }

  affecterAchatsLocaux(commandeId: number, affectations: {
    articleId: number;
    quantite: number;
    achatId: number;
  }[]): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/api/commandes/${commandeId}/affecter-achats-locaux`,
      { affectations }
    ).pipe(tap(() => this.refreshCommandes()));
  }

  affecterStockLibre(commandeId: number, affectations: {
    articleId: number;
    quantite: number;
    stockId: number;
  }[]): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/api/commandes/${commandeId}/affecter-stock-libre`,
      { affectations }
    ).pipe(tap(() => this.refreshCommandes()));
  }

  updateStatut(commandeId: number, statut: CommandeClient['statut']): Observable<void> {
    return this.http.put<void>(
      `${environment.apiUrl}/api/commandes/${commandeId}/statut`,
      { statut }
    ).pipe(tap(() => this.refreshCommandes()));
  }

  genererTaches(commandeId: number): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/api/commandes/${commandeId}/generer-taches`,
      {}
    );
  }
}




// Auto-generated aliases for backward compatibility
export type CommandeClient = ICommandeClient;
