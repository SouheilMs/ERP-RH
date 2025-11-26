import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const formationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ SEULEMENT RH ET MANAGERS RH PEUVENT ACCÉDER AUX FORMATIONS
  if (authService.isHR() || authService.isHRManager()) {
    return true;
  }

  // Rediriger les employés vers leur profil
  const currentUserId = authService.getCurrentUserId();
  if (currentUserId) {
    console.log('🚫 Employee trying to access formations - redirecting to profile');
    router.navigate(['/employees', currentUserId]);
  } else {
    router.navigate(['/login']);
  }
  
  return false;
};