import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, ApiResponse } from '../../shared/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private readonly tokenKey = environment.tokenKey;
  private readonly refreshTokenKey = environment.refreshTokenKey;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Vérifier si un token existe au démarrage
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.loadCurrentUser().subscribe();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/login`, credentials)
      .pipe(
        tap(loginResponse => {
          this.setSession(loginResponse);
        })
      );
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
          this.setSession(loginResponse);
        })
      );
  }

  private loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/Auth/me`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
  }

  private setSession(loginResponse: LoginResponse): void {
    localStorage.setItem(this.tokenKey, loginResponse.token);
    localStorage.setItem(this.refreshTokenKey, loginResponse.refreshToken);
    this.currentUserSubject.next(loginResponse.user);
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
      const exp = payload.exp * 1000; // Convert to milliseconds
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
    if (!user || !user.role || !user.role.permissions) {
      return false;
    }
    
    return user.role.permissions.some(permission => 
      permission.module === module && permission.action === action
    );
  }

  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.nom === roleName;
  }
}
