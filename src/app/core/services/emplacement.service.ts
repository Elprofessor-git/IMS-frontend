import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  // Méthodes spécifiques aux emplacements
  getByType(typeEmplacement: string): Observable<Emplacement[]> {
    return this.http.get<Emplacement[]>(`${this.apiUrl}/type/${typeEmplacement}`);
  }

  getByStatut(statut: string): Observable<Emplacement[]> {
    return this.http.get<Emplacement[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getHierarchy(): Observable<Emplacement[]> {
    return this.http.get<Emplacement[]>(`${this.apiUrl}/hierarchy`);
  }

  getEnfants(emplacementId: number): Observable<Emplacement[]> {
    return this.http.get<Emplacement[]>(`${this.apiUrl}/${emplacementId}/enfants`);
  }

  getParents(emplacementId: number): Observable<Emplacement[]> {
    return this.http.get<Emplacement[]>(`${this.apiUrl}/${emplacementId}/parents`);
  }

  updateStatut(id: number, statut: string): Observable<Emplacement> {
    return this.http.patch<Emplacement>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  updateCapacite(id: number, capaciteMax: number): Observable<Emplacement> {
    return this.http.patch<Emplacement>(`${this.apiUrl}/${id}/capacite`, { capaciteMax });
  }

  // Méthodes de statistiques
  getStatistiques(): Observable<EmplacementStats> {
    return this.http.get<EmplacementStats>(`${this.apiUrl}/statistiques`);
  }

  getStatistiquesEmplacement(emplacementId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${emplacementId}/statistiques`);
  }

  // Méthodes de validation
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

  // Méthodes de recherche avancée
  searchEmplacements(criteria: {
    code?: string;
    nom?: string;
    typeEmplacement?: string;
    statut?: string;
    emplacementParentId?: number;
    capaciteMin?: number;
    capaciteMax?: number;
  }): Observable<Emplacement[]> {
    return this.http.post<Emplacement[]>(`${this.apiUrl}/search`, criteria);
  }

  // Méthodes de gestion des stocks par emplacement
  getStockByEmplacement(emplacementId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${emplacementId}/stock`);
  }

  getEmplacementsDisponibles(articleId: number, quantiteRequise: number): Observable<Emplacement[]> {
    return this.http.get<Emplacement[]>(`${this.apiUrl}/disponibles`, {
      params: {
        articleId: articleId.toString(),
        quantiteRequise: quantiteRequise.toString()
      }
    });
  }

  // Méthodes de déplacement et réorganisation
  deplacerEmplacement(emplacementId: number, nouvelEmplacementParentId: number): Observable<Emplacement> {
    return this.http.patch<Emplacement>(`${this.apiUrl}/${emplacementId}/deplacer`, {
      nouvelEmplacementParentId
    });
  }

  reorganiserHierarchie(emplacements: { id: number; emplacementParentId?: number; niveau: number }[]): Observable<Emplacement[]> {
    return this.http.post<Emplacement[]>(`${this.apiUrl}/reorganiser`, { emplacements });
  }
}




// Auto-generated aliases for backward compatibility
export type Emplacement = IEmplacement;
export type EmplacementStats = IEmplacementStats;
