import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiService } from './base-api.service';

export interface IMouvementStock {
  id?: number;
  typeMouvement: string;
  articleId: number;
  quantite: number;
  emplacementSourceId?: number;
  emplacementDestinationId?: number;
  dateMouvement: Date;
  motif: string;
  referenceDocument?: string;
  utilisateurId: number;
  statut: string;
  notes?: string;
  article?: any;
  emplacementSource?: any;
  emplacementDestination?: any;
  utilisateur?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMouvementLigne {
  id?: number;
  mouvementId: number;
  articleId: number;
  quantite: number;
  emplacementSourceId?: number;
  emplacementDestinationId?: number;
  article?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MouvementService extends BaseApiService<MouvementStock> {
  protected endpoint = 'MouvementStock';

  constructor(http: HttpClient) {
    super(http);
  }

  // Méthodes spécifiques aux mouvements de stock
  getByType(typeMouvement: string): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.apiUrl}/type/${typeMouvement}`);
  }

  getByArticle(articleId: number): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.apiUrl}/article/${articleId}`);
  }

  getByEmplacement(emplacementId: number): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.apiUrl}/emplacement/${emplacementId}`);
  }

  getByDateRange(dateDebut: Date, dateFin: Date): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.apiUrl}/daterange`, {
      params: {
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin.toISOString()
      }
    });
  }

  updateStatut(id: number, statut: string): Observable<MouvementStock> {
    return this.http.patch<MouvementStock>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  // Gestion des lignes de mouvement
  getLignesMouvement(mouvementId: number): Observable<MouvementLigne[]> {
    return this.http.get<MouvementLigne[]>(`${this.apiUrl}/${mouvementId}/lignes`);
  }

  addLigneMouvement(mouvementId: number, ligne: Omit<MouvementLigne, 'id' | 'mouvementId'>): Observable<MouvementLigne> {
    return this.http.post<MouvementLigne>(`${this.apiUrl}/${mouvementId}/lignes`, ligne);
  }

  updateLigneMouvement(mouvementId: number, ligneId: number, ligne: Partial<MouvementLigne>): Observable<MouvementLigne> {
    return this.http.put<MouvementLigne>(`${this.apiUrl}/${mouvementId}/lignes/${ligneId}`, ligne);
  }

  deleteLigneMouvement(mouvementId: number, ligneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${mouvementId}/lignes/${ligneId}`);
  }

  // Méthodes de validation
  validateMouvement(mouvement: MouvementStock): string[] {
    const errors: string[] = [];

    if (!mouvement.typeMouvement) {
      errors.push('Le type de mouvement est requis');
    }

    if (!mouvement.articleId) {
      errors.push('L\'article est requis');
    }

    if (!mouvement.quantite || mouvement.quantite <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }

    if (!mouvement.dateMouvement) {
      errors.push('La date de mouvement est requise');
    }

    if (!mouvement.motif) {
      errors.push('Le motif est requis');
    }

    if (!mouvement.utilisateurId) {
      errors.push('L\'utilisateur est requis');
    }

    // Validation spécifique selon le type de mouvement
    switch (mouvement.typeMouvement) {
      case 'Transfert':
        if (!mouvement.emplacementSourceId) {
          errors.push('L\'emplacement source est requis pour un transfert');
        }
        if (!mouvement.emplacementDestinationId) {
          errors.push('L\'emplacement destination est requis pour un transfert');
        }
        if (mouvement.emplacementSourceId === mouvement.emplacementDestinationId) {
          errors.push('L\'emplacement source et destination ne peuvent pas être identiques');
        }
        break;
      case 'Sortie':
        if (!mouvement.emplacementSourceId) {
          errors.push('L\'emplacement source est requis pour une sortie');
        }
        break;
      case 'Entree':
        if (!mouvement.emplacementDestinationId) {
          errors.push('L\'emplacement destination est requis pour une entrée');
        }
        break;
    }

    return errors;
  }

  // Méthodes de calcul d'impact sur le stock
  calculateStockImpact(mouvement: MouvementStock): any {
    const impact = {
      articleId: mouvement.articleId,
      quantiteChange: 0,
      emplacementSourceId: mouvement.emplacementSourceId,
      emplacementDestinationId: mouvement.emplacementDestinationId
    };

    switch (mouvement.typeMouvement) {
      case 'Entree':
        impact.quantiteChange = mouvement.quantite;
        break;
      case 'Sortie':
        impact.quantiteChange = -mouvement.quantite;
        break;
      case 'Transfert':
        // Pour un transfert, on décrémente la source et on incrémente la destination
        // Cette logique sera gérée côté backend
        impact.quantiteChange = 0;
        break;
      case 'Ajustement':
        impact.quantiteChange = mouvement.quantite;
        break;
    }

    return impact;
  }

  // Méthodes de statistiques
  getStatistiques(dateDebut?: Date, dateFin?: Date): Observable<any> {
    const url = `${this.apiUrl}/statistiques`;
    const params: any = {};

    if (dateDebut) {
      params.dateDebut = dateDebut.toISOString();
    }
    if (dateFin) {
      params.dateFin = dateFin.toISOString();
    }

    return this.http.get(url, { params });
  }

  getMouvementsRecents(limit = 10): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.apiUrl}/recents?limit=${limit}`);
  }

  // Méthodes de validation de stock disponible
  checkStockDisponible(articleId: number, emplacementId: number, quantite: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-stock`, {
      params: {
        articleId: articleId.toString(),
        emplacementId: emplacementId.toString(),
        quantite: quantite.toString()
      }
    });
  }

  // Méthodes de traçabilité
  getHistoriqueArticle(articleId: number): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.apiUrl}/historique/article/${articleId}`);
  }

  getHistoriqueEmplacement(emplacementId: number): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.apiUrl}/historique/emplacement/${emplacementId}`);
  }
}



// Auto-generated aliases for backward compatibility
export type MouvementStock = IMouvementStock;
export type MouvementLigne = IMouvementLigne;
