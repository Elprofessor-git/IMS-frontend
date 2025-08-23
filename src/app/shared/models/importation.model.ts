import { Fournisseur } from './common.model';
import { CommandeClient } from './commande.model';
import { Article } from './stock.model';

export interface Importation {
  id: number;
  referenceImportation: string;
  fournisseurId: number;
  fournisseur?: Fournisseur;
  statut: StatutImportation;
  modeExpedition: ModeExpedition;
  dateImportation: Date;
  dateReceptionPrevue?: Date;
  dateReceptionReelle?: Date;
  montantTotal: number;
  devise: string;
  numeroFacture?: string;
  numeroDeclarationDouane?: string;
  commentaires?: string;
  dateCreation: Date;
  dateMiseAJour?: Date;
  modifiePar?: string;
  lignesImportation?: LigneImportation[];
}

export interface LigneImportation {
  id: number;
  importationId: number;
  importation?: Importation;
  articleId: number;
  article?: Article;
  commandeClientId?: number;
  commandeClient?: CommandeClient;
  couleur?: string;
  codeCouleur?: string;
  dimension?: string;
  quantite: number;
  prixUnitaire: number;
  montantLigne: number;
  devise: string;
  estAffecteStock: boolean;
  dateCreation: Date;
}

export enum StatutImportation {
  Brouillon = 'Brouillon',
  Soumise = 'Soumise',
  Validee = 'Validee',
  Recue = 'Recue',
  Annulee = 'Annulee'
}

export enum ModeExpedition {
  Maritime = 'Maritime',
  Aerien = 'Aerien',
  Terrestre = 'Terrestre',
  Express = 'Express'
}

