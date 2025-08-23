import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiService } from './base-api.service';

export interface Importation {
  id?: number;
  referenceImportation: string;
  fournisseurId: number;
  dateImportation: Date;
  modeExpedition: string;
  statut: string;
  montantTotal: number;
  notes?: string;
  lignesImportation?: LigneImportation[];
  fournisseur?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LigneImportation {
  id?: number;
  importationId: number;
  articleId: number;
  quantite: number;
  prixUnitaire: number;
  montantLigne: number;
  article?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ImportationService extends BaseApiService<Importation> {
  protected endpoint = 'Importation';

  constructor(http: HttpClient) {
    super(http);
  }

  // Méthodes spécifiques aux importations
  getByFournisseur(fournisseurId: number): Observable<Importation[]> {
    return this.http.get<Importation[]>(`${this.apiUrl}/fournisseur/${fournisseurId}`);
  }

  getByStatut(statut: string): Observable<Importation[]> {
    return this.http.get<Importation[]>(`${this.apiUrl}/statut/${statut}`);
  }

  updateStatut(id: number, statut: string): Observable<Importation> {
    return this.http.patch<Importation>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  getLignesImportation(importationId: number): Observable<LigneImportation[]> {
    return this.http.get<LigneImportation[]>(`${this.apiUrl}/${importationId}/lignes`);
  }

  addLigneImportation(importationId: number, ligne: Omit<LigneImportation, 'id' | 'importationId'>): Observable<LigneImportation> {
    return this.http.post<LigneImportation>(`${this.apiUrl}/${importationId}/lignes`, ligne);
  }

  updateLigneImportation(importationId: number, ligneId: number, ligne: Partial<LigneImportation>): Observable<LigneImportation> {
    return this.http.put<LigneImportation>(`${this.apiUrl}/${importationId}/lignes/${ligneId}`, ligne);
  }

  deleteLigneImportation(importationId: number, ligneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${importationId}/lignes/${ligneId}`);
  }

  // Méthodes de calcul
  calculateMontantTotal(lignes: LigneImportation[]): number {
    return lignes.reduce((total, ligne) => total + ligne.montantLigne, 0);
  }

  // Méthodes de validation
  validateImportation(importation: Importation): string[] {
    const errors: string[] = [];

    if (!importation.referenceImportation) {
      errors.push('La référence d\'importation est requise');
    }

    if (!importation.fournisseurId) {
      errors.push('Le fournisseur est requis');
    }

    if (!importation.dateImportation) {
      errors.push('La date d\'importation est requise');
    }

    if (!importation.modeExpedition) {
      errors.push('Le mode d\'expédition est requis');
    }

    if (!importation.statut) {
      errors.push('Le statut est requis');
    }

    if (importation.lignesImportation && importation.lignesImportation.length === 0) {
      errors.push('Au moins une ligne d\'importation est requise');
    }

    return errors;
  }
}

