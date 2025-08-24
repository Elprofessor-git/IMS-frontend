import { Plateforme, Fournisseur } from './common.model';
import { Article } from './stock.model';
import { TacheProduction } from './tache.model';
import { Achat } from './achat.model';

export interface Client {
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
  plateforme?: Plateforme;
  preferencesTissus?: string;
  estActif: boolean;
  dateCreation: Date;
  dateModification?: Date;
  commandes?: CommandeClient[];
}

export interface CommandeClient {
  id: number;
  numeroCommande: string;
  clientId: number;
  client?: Client;
  titreCommande: string;
  descriptionCommande?: string;
  dateLivraisonSouhaitee: Date;
  montantTotal: number;
  statut: StatutCommande;
  pourcentageRessourcesCouvertes: number;
  dateCreation: Date;
  dateModification?: Date;
  besoins?: BesoinCommande[];
  taches?: TacheProduction[];
  achats?: Achat[];
}

export interface BesoinCommande {
  id: number;
  commandeClientId: number;
  commandeClient?: CommandeClient;
  articleId: number;
  article?: Article;
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
