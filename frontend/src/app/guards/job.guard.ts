// src/app/guards/job.guard.ts - VERSION CORRIGÉE
import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const jobGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 jobGuard activated for route:', state.url);

  // Vérifier d'abord si l'utilisateur est connecté
  if (!authService.isLoggedIn()) {
    console.log('🚫 User not logged in - redirecting to login');
    router.navigate(['/login']);
    return false;
  }

  // ✅ DEBUG: Afficher les informations de l'utilisateur
  const currentUser = authService.getUser();
  const userRoles = authService.getUserRoles();
  
  console.log('🔍 jobGuard - User details:', {
    id: currentUser?.id,
    username: currentUser?.username,
    roles: userRoles,
    isHR: authService.isHR(),
    isHRManager: authService.isHRManager()
  });

  // ✅ CORRECTION : Vérifier explicitement les rôles RH et HRManager
  if (authService.isHR() || authService.isHRManager()) {
    console.log('✅ HR/Manager accessing job offers - ACCESS GRANTED');
    return true;
  }

  // Si l'utilisateur n'a pas les droits, on le redirige selon son rôle
  console.log('🚫 Access denied - User is not HR or Manager');
  
  if (authService.isEmployee()) {
    // Rediriger les employés vers leur profil
    const currentUserId = authService.getCurrentUserId();
    if (currentUserId) {
      console.log('📋 Employee redirected to profile');
      router.navigate(['/employees', currentUserId]);
    } else {
      console.log('📋 Employee redirected to my-profile');
      router.navigate(['/my-profile']);
    }
  } else {
    // Pour les autres rôles ou sans rôle, rediriger vers le dashboard
    console.log('🏠 User redirected to dashboard');
    router.navigate(['/employees']);
  }
  
  return false;
};