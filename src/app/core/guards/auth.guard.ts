import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const AuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier d'abord l'état synchrone
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si pas authentifié de manière synchrone, vérifier l'état asynchrone
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      
      // Rediriger vers login si pas authentifié
      router.navigate(['/login']);
      return false;
    })
  );
};


