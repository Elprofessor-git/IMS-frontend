import { IPlateforme, IFournisseur } from './common.model';
import { IArticle } from './stock.model';
import { ITacheProduction } from './tache.model';
import { IAchat } from './achat.model';

export interface IClient {
  id: number;
  nom?: string;
  prenom?: string;
  nomEntreprise?: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville: string;
  pays: string;
  codePostal?: string;
  plateformeId: number;
  plateforme?: IPlateforme;
  preferencesTissus?: string;
  estActif: boolean;
  dateCreation: Date;
  dateModification?: Date;
  commandes?: ICommandeClient[];
}

export interface ICommandeClient {
  id: number;
  numeroCommande: string;
  clientId: number;
  client?: IClient;
  titreCommande: string;
  descriptionCommande?: string;
  dateLivraisonSouhaitee: Date;
  montantTotal: number;
  statut: StatutCommande;
  pourcentageRessourcesCouvertes: number;
  dateCreation: Date;
  dateModification?: Date;
  besoins?: IBesoinCommande[];
  taches?: ITacheProduction[];
  achats?: IAchat[];
}

export interface IBesoinCommande {
  id: number;
  commandeClientId: number;
  commandeClient?: ICommandeClient;
  articleId: number;
  article?: IArticle;
  typeBesoin: TypeBesoin;
  couleur?: string;
  codeCouleur?: string;
  taille?: string;
  dimension?: string;
  quantiteUnitaire: number;
  nombrePieces: number;
  quantiteTotale: number;
  quantiteCouverte: number;
  dateCreation: Date;
}

export enum StatutCommande {
  Brouillon = 'Brouillon',
  EnAttente = 'EnAttente',
  RessourcesValidees = 'RessourcesValidees',
  Prete = 'Prete',
  EnProduction = 'EnProduction',
  Terminee = 'Terminee',
  Livree = 'Livree',
  Annulee = 'Annulee'
}

export enum TypeBesoin {
  MatierePremiere = 'MatierePremiere',
  Accessoire = 'Accessoire',
  Emballage = 'Emballage',
  Autre = 'Autre'
}

// Aliases without I-prefix for backward compatibility
export type Client = IClient;
export type CommandeClient = ICommandeClient;
export type BesoinCommande = IBesoinCommande;
