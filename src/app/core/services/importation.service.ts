import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiService } from './base-api.service';

export interface IImportation {
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

export interface ILigneImportation {
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

  // Méthodes spécifiques aux importations (alignées avec le backend)
  getByStatut(statut: string): Observable<Importation[]> {
    return this.http.get<Importation[]>(`${this.apiUrl}/Statut/${statut}`);
  }

  filtrer(params: { dateDebut?: string; dateFin?: string; fournisseurId?: number; statut?: string }): Observable<Importation[]> {
    const query = new URLSearchParams();
    if (params.dateDebut) query.append('dateDebut', params.dateDebut);
    if (params.dateFin) query.append('dateFin', params.dateFin);
    if (params.fournisseurId !== undefined) query.append('fournisseurId', String(params.fournisseurId));
    if (params.statut) query.append('statut', params.statut);
    const qs = query.toString();
    return this.http.get<Importation[]>(`${this.apiUrl}/Filtrer${qs ? `?${qs}` : ''}`);
  }

  getLignesImportation(importationId: number): Observable<LigneImportation[]> {
    // Le backend renvoie les lignes via GET /api/Importation/{id};
    // on conserve une route dédiée si nécessaire côté UI
    return this.http.get<LigneImportation[]>(`${this.apiUrl}/${importationId}/LignesImportation`);
  }

  addLigneImportation(importationId: number, ligne: Omit<LigneImportation, 'id' | 'importationId'>): Observable<LigneImportation> {
    return this.http.post<LigneImportation>(`${this.apiUrl}/${importationId}/LignesImportation`, ligne);
  }

  // Workflow: Soumettre → Valider → Recevoir → AffecterCommandes
  soumettreImportation(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/Soumettre`, {});
  }

  validerImportation(id: number, validePar: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/Valider`, validePar);
  }

  recevoirImportation(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/Recevoir`, {});
  }

  affecterCommandes(id: number): Observable<{ message: string; affectations: any[] }> {
    return this.http.post<{ message: string; affectations: any[] }>(`${this.apiUrl}/${id}/AffecterCommandes`, {});
  }

  // Compat: méthode utilisée par l'UI pour changer de statut générique
  // Mappe vers les endpoints réels (Soumettre/Valider/Recevoir); 'ANNULE' non supporté par l'API actuelle
  updateStatut(id: number, statut: string): Observable<any> {
    const normalized = (statut || '').toUpperCase();
    switch (normalized) {
      case 'SOUMISE':
        return this.soumettreImportation(id);
      case 'VALIDEE':
        return this.validerImportation(id, 'UI');
      case 'RECUE':
        return this.recevoirImportation(id);
      default:
        // Retourne un observable en erreur pour statuts non gérés (ex: ANNULE)
        return new Observable((subscriber) => {
          subscriber.error(`Statut non supporté: ${statut}`);
        });
    }
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




// Auto-generated aliases for backward compatibility
export type Importation = IImportation;
export type LigneImportation = ILigneImportation;
