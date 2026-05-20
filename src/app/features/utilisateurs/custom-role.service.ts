import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RolePermission {
  module: string;
  canAccess: boolean;
  canWrite: boolean;
}

export interface CustomRole {
  id: string;
  nom: string;
  description?: string;
  estSysteme: boolean;
  creeLe?: string;
  nbUtilisateurs?: number;
  permissions?: RolePermission[];
}

export const MODULES = [
  'dashboard', 'articles', 'stock', 'mouvements', 'achats',
  'importations', 'commandes', 'clients', 'fournisseurs',
  'taches', 'utilisateurs', 'roles', 'chatbot', 'rapports'
];

@Injectable({ providedIn: 'root' })
export class CustomRoleService {
  private apiUrl = `${environment.apiUrl}/roles`;
  private permUrl = `${environment.apiUrl}/Permission`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CustomRole[]> {
    return this.http.get<CustomRole[]>(this.apiUrl);
  }

  getById(id: string): Observable<CustomRole> {
    return this.http.get<CustomRole>(`${this.apiUrl}/${id}`);
  }

  create(role: { nom: string; description?: string }): Observable<CustomRole> {
    return this.http.post<CustomRole>(this.apiUrl, role);
  }

  update(id: string, role: { nom: string; description?: string }): Observable<CustomRole> {
    return this.http.put<CustomRole>(`${this.apiUrl}/${id}`, role);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPermissions(roleId: string): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(`${this.apiUrl}/${roleId}/Permissions`);
  }

  savePermissions(roleId: string, permissions: RolePermission[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${roleId}/Permissions`, permissions);
  }

  getMyPermissions(): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(`${this.permUrl}/me`);
  }
}
