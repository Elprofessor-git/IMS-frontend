// Import des modèles
import { User, Role, Permission, LoginRequest, LoginResponse } from './user.model';
import { Stock, Article, MouvementStock } from './stock.model';
import { CommandeClient, Client, BesoinCommande } from './commande.model';
import { TacheProduction } from './tache.model';
import { Achat, LigneAchat } from './achat.model';
import { Importation, LigneImportation } from './importation.model';

// Interfaces communes
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PagedRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: { [key: string]: any };
}

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'actions';
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

// Modèles spécifiques à l'API ASP.NET Core
export interface Plateforme {
  id: number;
  nom: string;
  description: string;
  siteWeb?: string;
  contactEmail?: string;
  contactTelephone?: string;
  estActif: boolean;
  dateCreation: Date;
  clients?: Client[];
}

export interface Fournisseur {
  id: number;
  nomEntreprise: string;
  personneContact: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville: string;
  pays: string;
  codePostal?: string;
  specialitesProduits?: string;
  delaiLivraisonJours: number;
  conditionsPaiement?: string;
  estActif: boolean;
  dateCreation: Date;
  dateModification?: Date;
  achats?: Achat[];
  importations?: Importation[];
}

// Types utilitaires
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'archived';

export interface AuditInfo {
  createdBy: number;
  createdAt: Date;
  modifiedBy?: number;
  modifiedAt?: Date;
}

// Constantes
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

// Export de tous les modèles
export {
  User, Role, Permission, LoginRequest, LoginResponse,
  Stock, Article, MouvementStock,
  CommandeClient, Client, BesoinCommande,
  TacheProduction,
  Achat, LigneAchat,
  Importation, LigneImportation
};
