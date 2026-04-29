import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, LoginRequest } from '../auth/auth.model';

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Utilisateur admin par défaut pour le développement
  private mockAdminUser: User = {
    id: '1',
    email: 'admin@textile.com',
    nom: 'Administrateur',
    prenom: 'Système',
    roles: ['admin', 'user']
  };

  login(credentials: LoginRequest): Observable<User> {
    // Vérification simple pour le mode développement
    if (credentials.email === 'admin@textile.com' && credentials.password === 'admin') {
      // Simuler un délai réseau
      return of(this.mockAdminUser).pipe(delay(1000));
    }
    
    throw new Error('Identifiants invalides');
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('textile_auth_token');
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null || localStorage.getItem('textile_auth_token') !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Méthode pour activer le mode mock
  enableMockMode(): void {
    const mockToken = 'mock-jwt-token-for-development';
    localStorage.setItem('textile_auth_token', mockToken);
    this.currentUserSubject.next(this.mockAdminUser);
  }
}


