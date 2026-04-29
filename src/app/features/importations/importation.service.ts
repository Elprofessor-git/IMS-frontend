import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseApiService } from '../../core/services/base-api.service';

export interface IImportation {
  id?: number;
  referenceImportation?: string; 
  reference?: string;
  fournisseurId: number;
  dateImportation: Date;
  modeExpedition: string;
  statut: string;
  montantTotal?: number; 
  notes?: string;
  lignesImportation?: LigneImportation[]; 
  produits?: any[];
  documents?: { type: string; url: string; dateUpload: Date; }[];
  modifications?: { date: Date; utilisateurId: number; description: string; }[];
  fournisseur?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILigneImportation {
  id?: number;
  importationId: number;
  articleId: number;
  quantite: number;
  prixUnitaire: number;
  montantLigne: number;
  article?: any;
}

export type Importation = IImportation;
export type LigneImportation = ILigneImportation;

@Injectable({
  providedIn: 'root'
})
export class ImportationService extends BaseApiService<Importation> {
  protected override endpoint = 'Importation';
  private importationsSubject = new BehaviorSubject<Importation[]>([]);

  constructor(http: HttpClient) {
    super(http);
    this.refreshImportations();
  }

  getImportationsObservable(): Observable<Importation[]> {
    return this.importationsSubject.asObservable();
  }

  refreshImportations(): void {
    this.http.get<Importation[]>(`${this.apiUrl}`)
      .subscribe({
        next: importations => this.importationsSubject.next(importations),
        error: () => {}
      });
  }

  creerImportation(importation: any): Observable<Importation> {
    return this.http.post<Importation>(`${this.apiUrl}`, importation)
      .pipe(tap(() => this.refreshImportations()));
  }

  uploadDocument(id: number, type: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.http.post<void>(`${this.apiUrl}/${id}/documents`, formData)
      .pipe(tap(() => this.refreshImportations()));
  }

  affecterACommande(id: number, affectations: any[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/affecter-commandes`, { affectations })
      .pipe(tap(() => this.refreshImportations()));
  }

  getHistoriqueModifications(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/modifications`);
  }

  rechercher(criteres: any): Observable<Importation[]> {
    return this.http.get<Importation[]>(`${this.apiUrl}/recherche`, { params: criteres });
  }

  getByStatut(statut: string): Observable<Importation[]> {
    return this.http.get<Importation[]>(`${this.apiUrl}/Statut/${statut}`);
  }

  filtrer(params: any): Observable<Importation[]> {
    const query = new URLSearchParams();
    if (params.dateDebut) query.append('dateDebut', params.dateDebut);
    if (params.dateFin) query.append('dateFin', params.dateFin);
    if (params.fournisseurId !== undefined) query.append('fournisseurId', String(params.fournisseurId));
    if (params.statut) query.append('statut', params.statut);
    const qs = query.toString();
    return this.http.get<Importation[]>(`${this.apiUrl}/Filtrer${qs ? `?${qs}` : ''}`);
  }

  getLignesImportation(importationId: number): Observable<LigneImportation[]> {
    return this.http.get<LigneImportation[]>(`${this.apiUrl}/${importationId}/LignesImportation`);
  }

  addLigneImportation(importationId: number, ligne: any): Observable<LigneImportation> {
    return this.http.post<LigneImportation>(`${this.apiUrl}/${importationId}/LignesImportation`, ligne);
  }

  soumettreImportation(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/Soumettre`, {})
      .pipe(tap(() => this.refreshImportations()));
  }

  validerImportation(id: number, validePar?: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/Valider`, validePar || 'UI')
      .pipe(tap(() => this.refreshImportations()));
  }

  recevoirImportation(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/Recevoir`, {})
      .pipe(tap(() => this.refreshImportations()));
  }

  affecterCommandes(id: number): Observable<{ message: string; affectations: any[] }> {
    return this.http.post<{ message: string; affectations: any[] }>(`${this.apiUrl}/${id}/AffecterCommandes`, {});
  }

  updateStatut(id: number, statut: string): Observable<any> {
    const normalized = (statut || '').toUpperCase();
    switch (normalized) {
      case 'SOUMISE': return this.soumettreImportation(id);
      case 'VALIDEE': return this.validerImportation(id, 'UI');
      case 'RECUE': return this.recevoirImportation(id);
      default: return new Observable((sub) => sub.error(`Statut non supporté: ${statut}`));
    }
  }

  calculateMontantTotal(lignes: LigneImportation[]): number {
    return lignes.reduce((total, ligne) => total + ligne.montantLigne, 0);
  }

  validateImportation(importation: Importation): string[] {
    const errors: string[] = [];
    if (!importation.referenceImportation && !importation.reference) errors.push('La référence est requise');
    if (!importation.fournisseurId) errors.push('Le fournisseur est requis');
    if (!importation.statut) errors.push('Le statut est requis');
    return errors;
  }
}
