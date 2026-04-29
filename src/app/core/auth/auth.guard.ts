import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        const requiredRoles = route.data['roles'] as Array<string>;
        if (requiredRoles && requiredRoles.length > 0) {
          if (authService.hasRole(requiredRoles)) {
            return true; // User has the required role
          } else {
            // Role not authorized
            snackBar.open('Accès non autorisé.', 'Fermer', { duration: 3000 });
            router.navigate(['/dashboard']); // or an unauthorized page
            return false;
          }
        }
        return true; // Authenticated and no specific role required
      }

      // Not authenticated
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};


