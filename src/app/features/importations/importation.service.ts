import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IImportation {
  id: number;
  reference: string;
  fournisseurId: number;
  dateImportation: Date;
  modeExpedition: string;
  statut: 'EN_COURS' | 'VALIDEE' | 'ANNULEE';
  produits: {
    id: number;
    designation: string;
    couleur: string;
    dimension: string;
    nature: string;
    quantite: number;
    prix: number;
    devise: string;
    commandeId?: number;
    clientId?: number;
    plateformeId?: number;
  }[];
  documents: {
    type: 'FACTURE' | 'BON_LIVRAISON' | 'CERTIFICAT_DOUANE';
    url: string;
    dateUpload: Date;
  }[];
  modifications: {
    date: Date;
    utilisateurId: number;
    description: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ImportationService {
  private importationsSubject = new BehaviorSubject<Importation[]>([]);

  constructor(private http: HttpClient) {
    this.refreshImportations();
  }

  getImportations(): Observable<Importation[]> {
    return this.importationsSubject.asObservable();
  }

  refreshImportations(): void {
    this.http.get<Importation[]>(`${environment.apiUrl}/api/importations`)
      .subscribe(importations => this.importationsSubject.next(importations));
  }

  creerImportation(importation: Omit<Importation, 'id'>): Observable<Importation> {
    return this.http.post<Importation>(
      `${environment.apiUrl}/api/importations`,
      importation
    ).pipe(tap(() => this.refreshImportations()));
  }

  validerImportation(id: number): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/api/importations/${id}/valider`,
      {}
    ).pipe(tap(() => {
      this.refreshImportations();
    }));
  }

  uploadDocument(id: number, type: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post<void>(
      `${environment.apiUrl}/api/importations/${id}/documents`,
      formData
    ).pipe(tap(() => this.refreshImportations()));
  }

  affecterACommande(id: number, affectations: {
    produitId: number;
    commandeId: number;
    quantite: number;
  }[]): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/api/importations/${id}/affecter-commandes`,
      { affectations }
    ).pipe(tap(() => this.refreshImportations()));
  }

  getHistoriqueModifications(id: number): Observable<Importation['modifications']> {
    return this.http.get<Importation['modifications']>(
      `${environment.apiUrl}/api/importations/${id}/modifications`
    );
  }

  rechercher(criteres: {
    dateDebut?: Date;
    dateFin?: Date;
    fournisseurId?: number;
    statut?: Importation['statut'];
    reference?: string;
  }): Observable<Importation[]> {
    return this.http.get<Importation[]>(
      `${environment.apiUrl}/api/importations/recherche`,
      { params: { ...criteres } }
    );
  }
}




// Auto-generated aliases for backward compatibility
export type Importation = IImportation;
