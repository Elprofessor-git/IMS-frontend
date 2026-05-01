import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// TODO: Define strong types for User and Role models
export interface IUser {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  prenom?: string;
  nom?: string;
  telephone?: string;
  dateNaissance?: string;
  genre?: string;
  poste?: string;
  departement?: string;
  managerId?: string;
  dateEmbauche?: string;
  salaire?: number;
  typeContrat?: string;
  forceChangePassword?: boolean;
  activerNotifications?: boolean;
  activerDoubleAuthentification?: boolean;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
  notes?: string;
  actif?: boolean;
  avatar?: string;
  derniereConnexion?: string;
  dateCreation?: string;
}

export interface IRole {
  id: string;
  name: string;
  normalizedName?: string;
  description?: string;
  couleur?: string; // For UI display
  niveau?: number; // Access level
}

export type User = IUser;
export type Role = IRole;


@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Account`; // Correction: éviter la duplication /api/api

  // User methods
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  // Role methods
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.apiUrl}/roles`);
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${environment.apiUrl}/roles`, role);
  }

  updateRole(id: string, role: Partial<Role>): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/roles/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/roles/${id}`);
  }
}


