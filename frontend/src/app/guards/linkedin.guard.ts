import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LinkedInGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Récupérer l'ID de l'utilisateur
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      this.router.navigate(['/login']);
      return false;
    }

    // Récupérer le rôle depuis le localStorage
    const userRole = localStorage.getItem('userRole');
    console.log('User role from localStorage:', userRole);
    
    if (!userRole) {
      this.router.navigate(['/login']);
      return false;
    }

    // Vérifier les rôles pour l'accès LinkedIn
    const allowedRoles = ['ADMIN', 'HRMANAGER', 'HR'];
    
    if (!allowedRoles.includes(userRole)) {
      // Rediriger vers la page d'accueil si l'utilisateur n'a pas les droits
      this.router.navigate(['/']);
      return false;
    }

    // Vérification spécifique pour la configuration LinkedIn (admin uniquement)
    if (route.routeConfig?.path === 'auth' && userRole !== 'ADMIN') {
      this.router.navigate(['/linkedin/status']);
      return false;
    }

    return true;
  }
}