// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      // Si déjà connecté et essaye d'accéder à login, rediriger selon le rôle
      if (state.url === '/login' || state.url === '/') {
        this.redirectBasedOnRole();
        return false;
      }
      return true;
    }

    // Si non connecté, rediriger vers login
    this.router.navigate(['/login']);
    return false;
  }

  private redirectBasedOnRole(): void {
    const userRoles = this.authService.getUserRoles();
    const userId = this.authService.getUser()?.id;

    console.log('🔄 Redirection automatique selon rôle:', userRoles);

    if (this.authService.isHR() || this.authService.isHRManager()) {
      console.log('🎯 Redirection RH vers /employees');
      this.router.navigate(['/employees']);
    } else if (this.authService.isEmployee()) {
      console.log('🎯 Redirection Employé vers son profil:', `/employees/${userId}`);
      this.router.navigate(['/employees', userId]);
    } else {
      console.log('🎯 Redirection par défaut vers /dashboard');
      this.router.navigate(['/dashboard']);
    }
  }
}
