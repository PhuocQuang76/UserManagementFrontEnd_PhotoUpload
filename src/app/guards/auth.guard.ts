import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    console.log('AuthGuard: Checking if user is logged in...');
    console.log('AuthGuard: Token exists:', !!this.authService.getToken());
    console.log('AuthGuard: isLoggedIn:', this.authService.isLoggedIn());

    // Check if user is logged in
    if (this.authService.isLoggedIn()) {
      console.log('AuthGuard: User is logged in, allowing access');

      // Check for required roles (if specified)
      const requiredRoles = route.data['roles'] as string[];
      if (requiredRoles && requiredRoles.length > 0) {
        const user = this.authService.getCurrentUser();
        if (user && requiredRoles.includes(user.role)) {
          return true;
        } else {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }

      return true;
    }

    // NOT logged in - redirect to login
    console.log('AuthGuard: User NOT logged in, redirecting to /login');
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}