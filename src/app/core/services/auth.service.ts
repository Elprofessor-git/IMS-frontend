import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../auth/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));

  private readonly tokenKey = environment.tokenKey;
  private readonly refreshTokenKey = environment.refreshTokenKey;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.loadCurrentUser().subscribe();
    }
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<any>(`${environment.apiUrl}/Auth/login`, credentials)
      .pipe(
        tap(response => {
          // Adapter la réponse selon le format du backend
          let user: User;
          let token: string;
          let refreshToken: string | undefined;
          
          // Vérifier tous les formats possibles
          if (response && response.user && response.token) {
            // Format attendu: { user: {...}, token: "...", refreshToken: "..." }
            user = response.user;
            token = response.token;
            refreshToken = response.refreshToken;
                      } else if (response && response.token) {
            // Format avec token mais sans objet user séparé
            if (response.email || response.userName || response.nom) {
              user = {
                id: response.id || response.userId || '1',
                email: response.email || response.userName || 'user@example.com',
                nom: response.nom || response.lastName || 'Utilisateur',
                prenom: response.prenom || response.firstName || '',
                roles: response.roles || ['user']
              };
              token = response.token;
              refreshToken = response.refreshToken;
                          } else {
              // Token seul, créer un utilisateur minimal
              user = {
                id: '1',
                email: 'admin@textile.com',
                nom: 'Administrateur',
                prenom: 'Système',
                roles: ['admin']
              };
              token = response.token;
              refreshToken = response.refreshToken;
                          }
          } else if (typeof response === 'string') {
            // Réponse est directement le token
            user = {
              id: '1',
              email: 'admin@textile.com',
              nom: 'Administrateur',
              prenom: 'Système',
              roles: ['admin']
            };
            token = response;
            refreshToken = undefined;
                      } else {
            console.error('Format de réponse non reconnu:', response);
            throw new Error(`Format de réponse invalide. Reçu: ${JSON.stringify(response)}`);
          }
          
          this.setSession(user, token, refreshToken);
                  }),
        map(response => {
          if (response && response.user) {
            return response.user;
          } else if (response && response.token) {
            if (response.email || response.userName || response.nom) {
              return {
                id: response.id || response.userId || '1',
                email: response.email || response.userName || 'user@example.com',
                nom: response.nom || response.lastName || 'Utilisateur',
                prenom: response.prenom || response.firstName || '',
                roles: response.roles || ['user']
              };
            } else {
              return {
                id: '1',
                email: 'admin@textile.com',
                nom: 'Administrateur',
                prenom: 'Système',
                roles: ['admin']
              };
            }
          } else if (typeof response === 'string') {
            return {
              id: '1',
              email: 'admin@textile.com',
              nom: 'Administrateur',
              prenom: 'Système',
              roles: ['admin']
            };
          }
          throw new Error('Impossible de créer l\'objet utilisateur');
        }),
        catchError(error => {
          console.error('Login error:', error);
          this.clearSession();
          return throwError(() => error);
        })
      );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/forgot-password`, { email });
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/Auth/logout`, { refreshToken }).subscribe();
    }

    this.clearSession();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/refresh`, { refreshToken })
      .pipe(
        tap(loginResponse => {
          this.setSession(loginResponse.user, loginResponse.token, loginResponse.refreshToken);
        })
      );
  }

  private loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/Auth/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Failed to load user', error);
        this.clearSession();
        return throwError(() => new Error('Impossible de charger le profil utilisateur'));
      })
    );
  }

  private setSession(user: User, token: string, refreshToken?: string): void {
    if (!user || !token) {
      console.error('Invalid session data');
      return;
    }
    
    try {
      localStorage.setItem(this.tokenKey, token);
      if (refreshToken) {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
      }
      // Mettre à jour l'utilisateur courant APRÈS avoir sauvé le token
      this.currentUserSubject.next(user);
          } catch (error) {
      console.error('Error saving session:', error);
      this.clearSession();
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasPermission(module: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles || user.roles.length === 0) {
      return false;
    }
    // Vérifie si l'utilisateur a le rôle admin qui a tous les droits
    if (user.roles.includes('admin')) {
      return true;
    }
    
    // Implémentation basique - à adapter selon votre système de permissions
    // Par exemple, vérifier si l'utilisateur a un rôle qui a la permission demandée
    // Cette logique devra être adaptée à votre système de permissions réel
    return user.roles.some(role => {
      // Logique de vérification des permissions par rôle
      // À remplacer par votre logique métier
      return role === module || role === `${module}.${action}`;
    });
  }

  hasRole(requiredRoles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user?.roles || user.roles.length === 0) {
      return false;
    }
    return user.roles.some(role => requiredRoles.includes(role));
  }
}


