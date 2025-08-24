import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MockAuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Pour la démo, on permet toujours l'accès
    // En production, vous devriez vérifier l'authentification réelle
    return true;
  }
}
