import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      // Verificar permissões requeridas (se houver)
      const requiredPermissions = route.data['permissions'] as Array<{ resource: string; action: string }> | undefined;

      if (requiredPermissions) {
        const hasPermission = requiredPermissions.some((perm) =>
          this.authService.hasPermission(perm.resource, perm.action),
        );

        if (!hasPermission) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }

      return true;
    }

    // Não autenticado - redirecionar para login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
