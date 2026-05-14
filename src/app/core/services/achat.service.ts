import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiService } from './base-api.service';

export interface IAchat {
  id?: number;
  referenceAchat: string;
  fournisseurId: number;
  dateAchat: Date;
  dateLivraisonPrevue?: Date;
  dateLivraisonEffective?: Date;
  statut: string;
  montantTotal: number;
  montantHT: number;
  montantTVA: number;
  tauxTVA: number;
  modePaiement: string;
  conditionsPaiement: string;
  notes?: string;
  lignesAchat?: LigneAchat[];
  fournisseur?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILigneAchat {
  id?: number;
  achatId: number;
  articleId: number;
  quantite: number;
  prixUnitaire: number;
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  tauxTVA: number;
  article?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AchatService extends BaseApiService<Achat> {
  protected endpoint = 'Achat';

  constructor(http: HttpClient) {
    super(http);
  }

  // Méthodes spécifiques aux achats
  getByStatut(statut: string): Observable<Achat[]> {
    return this.http.get<Achat[]>(`${this.apiUrl}/Statut/${statut}`);
  }

  confirmerLivraison(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/Livrer`, {});
  }

  // Méthodes de calcul
  calculateMontants(lignes: LigneAchat[], tauxTVA = 20): any {
    const montantHT = lignes.reduce((total, ligne) => total + ligne.montantHT, 0);
    const montantTVA = montantHT * (tauxTVA / 100);
    const montantTTC = montantHT + montantTVA;

    return {
      montantHT,
      montantTVA,
      montantTTC,
      tauxTVA
    };
  }

  calculateLigneMontants(ligne: LigneAchat, tauxTVA = 20): LigneAchat {
    const montantHT = ligne.quantite * ligne.prixUnitaire;
    const montantTVA = montantHT * (tauxTVA / 100);
    const montantTTC = montantHT + montantTVA;

    return {
      ...ligne,
      montantHT,
      montantTVA,
      montantTTC,
      tauxTVA
    };
  }

  // Méthodes de validation
  validateAchat(achat: Achat): string[] {
    const errors: string[] = [];

    if (!achat.referenceAchat) {
      errors.push('La référence d\'achat est requise');
    }

    if (!achat.fournisseurId) {
      errors.push('Le fournisseur est requis');
    }

    if (!achat.dateAchat) {
      errors.push('La date d\'achat est requise');
    }

    if (!achat.statut) {
      errors.push('Le statut est requis');
    }

    if (achat.montantTotal <= 0) {
      errors.push('Le montant total doit être supérieur à 0');
    }

    if (achat.lignesAchat && achat.lignesAchat.length === 0) {
      errors.push('Au moins une ligne d\'achat est requise');
    }

    // Validation des dates
    if (achat.dateLivraisonPrevue && achat.dateAchat > achat.dateLivraisonPrevue) {
      errors.push('La date de livraison prévue ne peut pas être antérieure à la date d\'achat');
    }

    if (achat.dateLivraisonEffective && achat.dateAchat > achat.dateLivraisonEffective) {
      errors.push('La date de livraison effective ne peut pas être antérieure à la date d\'achat');
    }

    return errors;
  }

  validateLigneAchat(ligne: LigneAchat): string[] {
    const errors: string[] = [];

    if (!ligne.articleId) {
      errors.push('L\'article est requis');
    }

    if (!ligne.quantite || ligne.quantite <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }

    if (!ligne.prixUnitaire || ligne.prixUnitaire <= 0) {
      errors.push('Le prix unitaire doit être supérieur à 0');
    }

    return errors;
  }

  getAchatsParFournisseur(fournisseurId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Fournisseur/${fournisseurId}/Historique`);
  }

  // Méthodes de workflow
  validerAchat(achatId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${achatId}/Confirmer`, {});
  }

  annulerAchat(achatId: number, motif: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${achatId}`);
  }
}




// Auto-generated aliases for backward compatibility
export type Achat = IAchat;
export type LigneAchat = ILigneAchat;
