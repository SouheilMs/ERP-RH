import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const formationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier d'abord si l'utilisateur est connecté
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  //  RH ET RH MANAGER DOIVENT POUVOIR ACCÉDER
  const canAccess = authService.isHRorManager();

  if (canAccess) {
    console.log(' Access granted to formations');
    return true;
  }
  // Rediriger selon le rôle
  if (authService.isEmployee()) {
    const currentUserId = authService.getCurrentUserId();
    if (currentUserId) {
      router.navigate(['/employees', currentUserId]);
    } else {
      router.navigate(['/profile']);
    }
  } else {
    router.navigate(['/unauthorized']);
  }

  return false;
};
