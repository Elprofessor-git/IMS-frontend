import { IFournisseur } from './common.model';
import { ICommandeClient } from './commande.model';
import { IArticle } from './stock.model';

export interface IAchat {
  id: number;
  numeroAchat: string;
  fournisseurId: number;
  fournisseur?: IFournisseur;
  commandeClientId: number;
  commandeClient?: ICommandeClient;
  statut: StatutAchat;
  montantTotal: number;
  devise: string;
  dateLivraisonPrevue?: Date;
  dateLivraisonReelle?: Date;
  commentaires?: string;
  dateCreation: Date;
  dateMiseAJour?: Date;
  lignesAchat?: ILigneAchat[];
}

export interface ILigneAchat {
  id: number;
  achatId: number;
  achat?: IAchat;
  articleId: number;
  article?: IArticle;
  couleur?: string;
  codeCouleur?: string;
  taille?: string;
  dimension?: string;
  quantite: number;
  prixUnitaire: number;
  montantLigne: number;
  devise: string;
  dateCreation: Date;
}

export enum StatutAchat {
  Brouillon = 'Brouillon',
  Soumis = 'Soumis',
  Confirme = 'Confirme',
  Livre = 'Livre',
  Annule = 'Annule'
}

// Aliases without I-prefix for backward compatibility
export type Achat = IAchat;
export type LigneAchat = ILigneAchat;
