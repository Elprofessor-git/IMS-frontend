import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface IEmplacement {
  id?: number;
  code: string;
  nom: string;
  description?: string;
  typeEmplacement: string;
  capaciteMax?: number;
  capaciteActuelle?: number;
  statut: string;
  emplacementParentId?: number;
  niveau: number;
  chemin?: string;
  emplacementParent?: Emplacement;
  emplacementsEnfants?: Emplacement[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEmplacementStats {
  totalEmplacements: number;
  emplacementsActifs: number;
  emplacementsInactifs: number;
  capaciteTotale: number;
  capaciteUtilisee: number;
  tauxOccupation: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmplacementService extends BaseApiService<Emplacement> {
  protected endpoint = 'Emplacement';

  constructor(http: HttpClient) {
    super(http);
  }

  getByType(_typeEmplacement: string): Observable<Emplacement[]> {
    return of([]);
  }

  getByStatut(_statut: string): Observable<Emplacement[]> {
    return of([]);
  }

  getHierarchy(): Observable<Emplacement[]> {
    return of([]);
  }

  getEnfants(_emplacementId: number): Observable<Emplacement[]> {
    return of([]);
  }

  getParents(_emplacementId: number): Observable<Emplacement[]> {
    return of([]);
  }

  updateStatut(_id: number, _statut: string): Observable<Emplacement> {
    return of({} as Emplacement);
  }

  updateCapacite(_id: number, _capaciteMax: number): Observable<Emplacement> {
    return of({} as Emplacement);
  }

  getStatistiques(): Observable<EmplacementStats> {
    return of({} as EmplacementStats);
  }

  getStatistiquesEmplacement(_emplacementId: number): Observable<any> {
    return of({});
  }

  validateEmplacement(emplacement: Emplacement): string[] {
    const errors: string[] = [];

    if (!emplacement.code) {
      errors.push('Le code de l\'emplacement est requis');
    }

    if (!emplacement.nom) {
      errors.push('Le nom de l\'emplacement est requis');
    }

    if (!emplacement.typeEmplacement) {
      errors.push('Le type d\'emplacement est requis');
    }

    if (emplacement.capaciteMax && emplacement.capaciteMax <= 0) {
      errors.push('La capacité maximale doit être supérieure à 0');
    }

    if (emplacement.capaciteActuelle && emplacement.capaciteMax &&
        emplacement.capaciteActuelle > emplacement.capaciteMax) {
      errors.push('La capacité actuelle ne peut pas dépasser la capacité maximale');
    }

    if (emplacement.niveau < 0) {
      errors.push('Le niveau doit être supérieur ou égal à 0');
    }

    return errors;
  }

  searchEmplacements(_criteria: {
    code?: string;
    nom?: string;
    typeEmplacement?: string;
    statut?: string;
    emplacementParentId?: number;
    capaciteMin?: number;
    capaciteMax?: number;
  }): Observable<Emplacement[]> {
    return of([]);
  }

  getStockByEmplacement(_emplacementId: number): Observable<any[]> {
    return of([]);
  }

  getEmplacementsDisponibles(_articleId: number, _quantiteRequise: number): Observable<Emplacement[]> {
    return of([]);
  }

  deplacerEmplacement(_emplacementId: number, _nouvelEmplacementParentId: number): Observable<Emplacement> {
    return of({} as Emplacement);
  }

  reorganiserHierarchie(_emplacements: { id: number; emplacementParentId?: number; niveau: number }[]): Observable<Emplacement[]> {
    return of([]);
  }
}




// Auto-generated aliases for backward compatibility
export type Emplacement = IEmplacement;
export type EmplacementStats = IEmplacementStats;
