import { CommandeClient } from './commande.model';
import { MouvementStock } from './stock.model';

export interface TacheProduction {
  id: number;
  titre: string;
  description?: string;
  commandeClientId?: number;
  commandeClient?: CommandeClient;
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
  mouvementsStock?: MouvementStock[];
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
