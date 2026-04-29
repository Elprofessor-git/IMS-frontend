import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../features/utilisateurs/user.service';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface IAuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {
    this.checkToken();
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/api/auth/login`,
      { username, password }
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  hasPermission(module: string, action: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    return user.role.permissions.some(p => 
      p.module === module && p.actions.includes(action as any)
    );
  }

  private checkToken() {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.http.get<User>(`${environment.apiUrl}/api/auth/me`).subscribe(
        user => this.currentUserSubject.next(user)
      );
    }
  }
}




// Auto-generated aliases for backward compatibility
export type AuthResponse = IAuthResponse;
