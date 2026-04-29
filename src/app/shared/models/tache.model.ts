import { ICommandeClient } from './commande.model';
import { IMouvementStock } from './stock.model';

export interface ITacheProduction {
  id: number;
  titre: string;
  description?: string;
  commandeClientId?: number;
  commandeClient?: ICommandeClient;
  statut: StatutTache;
  priorite: PrioriteTache;
  pourcentageAvancement: number;
  assigneA?: string;
  dateCreation: Date;
  dateDebutPrevue: Date;
  dateFinPrevue: Date;
  dateDebutReelle?: Date;
  dateFinReelle?: Date;
  commentaires?: string;
  motifBlocage?: string;
  mouvementsStock?: IMouvementStock[];
}

export enum StatutTache {
  NonCommence = 'NonCommence',
  EnCours = 'EnCours',
  Bloque = 'Bloque',
  Termine = 'Termine',
  Annule = 'Annule'
}

export enum PrioriteTache {
  Basse = 'Basse',
  Normale = 'Normale',
  Haute = 'Haute',
  Critique = 'Critique'
}

// Alias without I-prefix for backward compatibility
export type TacheProduction = ITacheProduction;
