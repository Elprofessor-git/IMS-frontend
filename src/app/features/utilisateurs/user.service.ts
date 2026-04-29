import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IUser {
  id: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  statut: 'ACTIF' | 'INACTIF';
  derniereConnexion?: Date;
}

export interface IRole {
  id: number;
  nom: string;
  permissions: Permission[];
}

export interface IPermission {
  module: string;
  actions: ('LECTURE' | 'ECRITURE' | 'SUPPRESSION' | 'VALIDATION')[];
}

export interface IActionLog {
  id: number;
  userId: number;
  action: string;
  module: string;
  details: string;
  date: Date;
  ip: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  private rolesSubject = new BehaviorSubject<Role[]>([]);

  constructor(private http: HttpClient) {
    this.refreshUsers();
    this.refreshRoles();
  }

  getUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  getRoles(): Observable<Role[]> {
    return this.rolesSubject.asObservable();
  }

  refreshUsers(): void {
    this.http.get<User[]>(`${environment.apiUrl}/api/users`)
      .subscribe(users => this.usersSubject.next(users));
  }

  refreshRoles(): void {
    this.http.get<Role[]>(`${environment.apiUrl}/api/roles`)
      .subscribe(roles => this.rolesSubject.next(roles));
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(
      `${environment.apiUrl}/api/users`,
      user
    ).pipe(tap(() => this.refreshUsers()));
  }

  updateUser(id: number, updates: Partial<User>): Observable<void> {
    return this.http.put<void>(
      `${environment.apiUrl}/api/users/${id}`,
      updates
    ).pipe(tap(() => this.refreshUsers()));
  }

  createRole(role: Omit<Role, 'id'>): Observable<Role> {
    return this.http.post<Role>(
      `${environment.apiUrl}/api/roles`,
      role
    ).pipe(tap(() => this.refreshRoles()));
  }

  updateRole(id: number, updates: Partial<Role>): Observable<void> {
    return this.http.put<void>(
      `${environment.apiUrl}/api/roles/${id}`,
      updates
    ).pipe(tap(() => this.refreshRoles()));
  }

  desactiverCompte(id: number): Observable<void> {
    return this.updateUser(id, { statut: 'INACTIF' });
  }

  activerCompte(id: number): Observable<void> {
    return this.updateUser(id, { statut: 'ACTIF' });
  }

  reinitialiserMotDePasse(id: number): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(
      `${environment.apiUrl}/api/users/${id}/reset-password`,
      {}
    );
  }

  getActionLogs(criteres?: {
    userId?: number;
    module?: string;
    dateDebut?: Date;
    dateFin?: Date;
  }): Observable<ActionLog[]> {
    return this.http.get<ActionLog[]>(
      `${environment.apiUrl}/api/logs/actions`,
      { params: criteres as any }
    );
  }

  getConnexionLogs(criteres?: {
    userId?: number;
    dateDebut?: Date;
    dateFin?: Date;
  }): Observable<ActionLog[]> {
    return this.http.get<ActionLog[]>(
      `${environment.apiUrl}/api/logs/connexions`,
      { params: criteres as any }
    );
  }

  hasPermission(userId: number, module: string, action: Permission['actions'][0]): Observable<boolean> {
    return this.http.get<boolean>(
      `${environment.apiUrl}/api/users/${userId}/check-permission`,
      { params: { module, action } }
    );
  }
}




// Auto-generated aliases for backward compatibility
export type User = IUser;
export type Role = IRole;
export type Permission = IPermission;
export type ActionLog = IActionLog;
