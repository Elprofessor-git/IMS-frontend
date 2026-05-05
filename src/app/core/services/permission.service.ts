import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RolePermission } from '../../features/utilisateurs/custom-role.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private perms = new BehaviorSubject<RolePermission[]>([]);
  perms$ = this.perms.asObservable();

  constructor(private http: HttpClient) {}

  loadMyPermissions(): Observable<void> {
    return this.http.get<RolePermission[]>(`${environment.apiUrl}/Permission/me`).pipe(
      tap(p => this.perms.next(p)),
      map(() => void 0),
      catchError(() => {
        this.perms.next([{ module: 'dashboard', canAccess: true, canWrite: false }]);
        return of(void 0);
      })
    );
  }

  loadIfNeeded(): Observable<void> {
    if (this.perms.value.length > 0) return of(void 0);
    return this.loadMyPermissions();
  }

  canAccess(module: string): boolean {
    if (this.isAdmin()) return true;
    return this.perms.value.find(p => p.module === module)?.canAccess ?? false;
  }

  canWrite(module: string): boolean {
    if (this.isAdmin()) return true;
    return this.perms.value.find(p => p.module === module)?.canWrite ?? false;
  }

  isAdmin(): boolean {
    const p = this.perms.value;
    return p.length > 0 && p.every(p => p.canAccess && p.canWrite);
  }

  clearPermissions(): void {
    this.perms.next([]);
  }
}
