// src/app/guards/job.guard.ts - VERSION CORRIGÉE
import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const jobGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier d'abord si l'utilisateur est connecté
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const currentUser = authService.getUser();
  const userRoles = authService.getUserRoles();

  // Autoriser l'accès uniquement aux RH et Managers
  if (authService.isHR() || authService.isHRManager()) {
    return true;
  }
  
  if (authService.isEmployee()) {
    // Rediriger les employés vers leur profil
    const currentUserId = authService.getCurrentUserId();
    if (currentUserId) {
      router.navigate(['/employees', currentUserId]);
    } else {
      router.navigate(['/my-profile']);
    }
  } else {
    // Pour les autres rôles ou sans rôle, rediriger vers le dashboard
    router.navigate(['/employees']);
  }
  
  return false;
};