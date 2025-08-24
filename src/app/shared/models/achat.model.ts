import { Fournisseur } from './common.model';
import { CommandeClient } from './commande.model';
import { Article } from './stock.model';

export interface Achat {
  id: number;
  numeroAchat: string;
  fournisseurId: number;
  fournisseur?: Fournisseur;
  commandeClientId: number;
  commandeClient?: CommandeClient;
  statut: StatutAchat;
  montantTotal: number;
  devise: string;
  dateLivraisonPrevue?: Date;
  dateLivraisonReelle?: Date;
  commentaires?: string;
  dateCreation: Date;
  dateMiseAJour?: Date;
  lignesAchat?: LigneAchat[];
}

export interface LigneAchat {
  id: number;
  achatId: number;
  achat?: Achat;
  articleId: number;
  article?: Article;
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
