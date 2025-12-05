// auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      // Stocker l'URL demandée pour redirection après login
      const returnUrl = route.url.join('/');
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return false;
    }
  }
}