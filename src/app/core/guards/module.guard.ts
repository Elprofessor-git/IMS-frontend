import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';

export const moduleGuard = (module: string): CanActivateFn => () => {
  const authService = inject(AuthService);
  const perm = inject(PermissionService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  return perm.loadIfNeeded().pipe(
    map(() => {
      if (perm.canAccess(module)) return true;
      router.navigate(['/dashboard']);
      return false;
    })
  );
};
