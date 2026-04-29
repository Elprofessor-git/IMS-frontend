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
  getByFournisseur(fournisseurId: number): Observable<Achat[]> {
    return this.http.get<Achat[]>(`${this.apiUrl}/fournisseur/${fournisseurId}`);
  }

  getByStatut(statut: string): Observable<Achat[]> {
    return this.http.get<Achat[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getByDateRange(dateDebut: Date, dateFin: Date): Observable<Achat[]> {
    return this.http.get<Achat[]>(`${this.apiUrl}/daterange`, {
      params: {
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin.toISOString()
      }
    });
  }

  updateStatut(id: number, statut: string): Observable<Achat> {
    return this.http.patch<Achat>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  confirmerLivraison(id: number, dateLivraison: Date): Observable<Achat> {
    return this.http.patch<Achat>(`${this.apiUrl}/${id}/livraison`, { dateLivraison });
  }

  // Gestion des lignes d'achat
  getLignesAchat(achatId: number): Observable<LigneAchat[]> {
    return this.http.get<LigneAchat[]>(`${this.apiUrl}/${achatId}/lignes`);
  }

  addLigneAchat(achatId: number, ligne: Omit<LigneAchat, 'id' | 'achatId'>): Observable<LigneAchat> {
    return this.http.post<LigneAchat>(`${this.apiUrl}/${achatId}/lignes`, ligne);
  }

  updateLigneAchat(achatId: number, ligneId: number, ligne: Partial<LigneAchat>): Observable<LigneAchat> {
    return this.http.put<LigneAchat>(`${this.apiUrl}/${achatId}/lignes/${ligneId}`, ligne);
  }

  deleteLigneAchat(achatId: number, ligneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${achatId}/lignes/${ligneId}`);
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

  getAchatsRecents(limit = 10): Observable<Achat[]> {
    return this.http.get<Achat[]>(`${this.apiUrl}/recents?limit=${limit}`);
  }

  getAchatsEnRetard(): Observable<Achat[]> {
    return this.http.get<Achat[]>(`${this.apiUrl}/retard`);
  }

  // Méthodes de suivi
  getSuiviAchats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/suivi`);
  }

  getAchatsParFournisseur(fournisseurId: number): Observable<Achat[]> {
    return this.http.get<Achat[]>(`${this.apiUrl}/fournisseur/${fournisseurId}/historique`);
  }

  // Méthodes de génération de documents
  genererBonCommande(achatId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${achatId}/bon-commande`, { responseType: 'blob' });
  }

  genererFacture(achatId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${achatId}/facture`, { responseType: 'blob' });
  }

  // Méthodes de workflow
  validerAchat(achatId: number): Observable<Achat> {
    return this.http.patch<Achat>(`${this.apiUrl}/${achatId}/valider`, {});
  }

  annulerAchat(achatId: number, motif: string): Observable<Achat> {
    return this.http.patch<Achat>(`${this.apiUrl}/${achatId}/annuler`, { motif });
  }

  // Méthodes de recherche avancée
  rechercherAchats(criteres: any): Observable<Achat[]> {
    return this.http.post<Achat[]>(`${this.apiUrl}/recherche`, criteres);
  }

  // Méthodes de duplication
  dupliquerAchat(achatId: number): Observable<Achat> {
    return this.http.post<Achat>(`${this.apiUrl}/${achatId}/dupliquer`, {});
  }

  // Méthodes de notification
  getNotificationsAchats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`);
  }

  marquerCommeLue(notificationId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/notifications/${notificationId}/lue`, {});
  }
}




// Auto-generated aliases for backward compatibility
export type Achat = IAchat;
export type LigneAchat = ILigneAchat;
