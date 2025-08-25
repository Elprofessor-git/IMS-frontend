import { TacheProduction } from './tache.model';

export interface Article {
  id: number;
  imageUrl?: string;
  designation: string;
  description?: string;
  categorie: string;
  sousCategorie?: string;
  unite: string;
  reference: string;
  seuilAlerte: number;
  seuilCritique: number;
  prixUnitaireMoyen: number;
  estActif: boolean;
  dateCreation: Date;
  stocks?: Stock[];
  besoinsCommande?: any[];
  lignesAchat?: any[];
  lignesImportation?: any[];
}

export interface Stock {
  id: number;
  articleId: number;
  article?: Article;
  couleur?: string;
  codeCouleur?: string;
  taille?: string;
  dimension?: string;
  quantite: number;
  quantiteReservee: number;
  typeStock: TypeStock;
  emplacementPhysique?: string;
  prixUnitaire: number;
  devise?: string;
  dateEntree: Date;
  estValide: boolean;
  validePar?: string;
  dateValidation?: Date;
  mouvements?: MouvementStock[];
}

export interface MouvementStock {
  id: number;
  stockId: number;
  stock?: Stock;
  tacheProductionId?: number;
  tacheProduction?: TacheProduction;
  typeMouvement: TypeMouvement;
  origineMouvement: OrigineMouvement;
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  emplacementSource?: string;
  emplacementDestination?: string;
  motif?: string;
  documentReference?: string;
  dateMouvement: Date;
  effectuePar: string;
}

export enum TypeStock {
  Libre = 'Libre',
  Reserve = 'Reserve',
  Importe = 'Importe'
}

export enum TypeMouvement {
  Entree = 'Entree',
  Sortie = 'Sortie',
  Transfert = 'Transfert',
  Ajustement = 'Ajustement',
  Reservation = 'Reservation',
  Liberation = 'Liberation'
}

export enum OrigineMouvement {
  Achat = 'Achat',
  Importation = 'Importation',
  Production = 'Production',
  Transfert = 'Transfert',
  Ajustement = 'Ajustement',
  Reservation = 'Reservation',
  Autre = 'Autre'
}

export interface StockSummary {
  totalArticles: number;
  totalStock: number;
  articlesEnAlerte: number;
  articlesCritiques: number;
  valeurTotaleStock: number;
  mouvementsRecents: number;
  stockParCategorie: { [key: string]: number };
  evolutionStock: { date: string; quantite: number }[];
}