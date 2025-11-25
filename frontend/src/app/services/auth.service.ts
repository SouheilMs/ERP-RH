import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Interfaces exportées
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface SignupResponse {
  username: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtResponse {
  accessToken: string;
  tokenType: string;
  id: string;
  username: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  private router = inject(Router);
  private http = inject(HttpClient);

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userRolesSubject = new BehaviorSubject<string[]>(this.getStoredUserRoles());

  constructor() {
    console.log('🔄 AuthService initialisé');
    console.log('🔐 Token initial:', this.getToken() ? 'PRÉSENT' : 'NULL');
  }

  // Méthodes d'authentification
  signup(signupRequest: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, signupRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    console.log('🔄 Tentative de login vers:', `${this.apiUrl}/signin`);

    return this.http.post<JwtResponse>(`${this.apiUrl}/signin`, loginRequest)
      .pipe(
        tap((response: JwtResponse) => {
          console.log('✅ Réponse login reçue:', response);

          // Stocker le token et les infos utilisateur
          localStorage.setItem('authToken', response.accessToken);
          const userData = {
            id: response.id,
            username: response.username,
            email: response.email,
            roles: response.roles
          };
          localStorage.setItem('user', JSON.stringify(userData));

          console.log('💾 Données stockées dans localStorage');
          console.log('🔐 Token stocké:', response.accessToken ? 'OUI' : 'NON');

          this.isLoggedInSubject.next(true);
          this.userRolesSubject.next(response.roles);

          console.log('🔓 Nouvel état isLoggedIn:', true);
          console.log('🎯 Nouveaux rôles:', response.roles);
        }),
        catchError(this.handleError)
      );
  }

  resetPassword(resetRequest: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, resetRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): void {
    console.log('🚪 Déconnexion en cours...');

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
    this.userRolesSubject.next([]);

    console.log('🧹 Données localStorage nettoyées');
    console.log('🔓 Nouvel état isLoggedIn:', false);

    this.router.navigate(['/login']);
  }

  // Méthodes pour gérer les rôles
  getUserRole(): string {
    const user = this.getUser();
    return user?.roles?.[0] || '';
  }

  getUserRoles(): string[] {
    const user = this.getUser();
    return user?.roles || [];
  }

  isHR(): boolean {
    const roles = this.getUserRoles();
    return roles.includes('ROLE_HR') || roles.includes('ROLE_HRMANAGER');
  }

  isEmployee(): boolean {
    return this.getUserRoles().includes('ROLE_EMPLOYEE');
  }

  isHRManager(): boolean {
    return this.getUserRoles().includes('ROLE_HRMANAGER');
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return requiredRoles.some(role => userRoles.includes(role));
  }

  hasAllRoles(requiredRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return requiredRoles.every(role => userRoles.includes(role));
  }

  // Méthode utilitaire pour le dashboard
  canViewEmployeeList(): boolean {
    return this.isHR() || this.isHRManager();
  }

  // Getters basiques - CORRIGÉ (pas de duplication)
  getToken(): string | null {
    const token = localStorage.getItem('authToken');
    console.log('🔍 AuthService.getToken():', token ? 'PRÉSENT' : 'NULL');
    return token;
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;
    console.log('🔍 AuthService.getUser():', parsedUser);
    return parsedUser;
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getAuthStatus(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  getUserRolesObservable(): Observable<string[]> {
    return this.userRolesSubject.asObservable();
  }

  // Méthode de debug
  debugAuth(): void {
    console.log('🐛 DEBUG AUTH SERVICE:');
    console.log('🔐 Token:', this.getToken());
    console.log('👤 User:', this.getUser());
    console.log('🔓 isLoggedIn:', this.isLoggedIn());
    console.log('🎯 Roles:', this.getUserRoles());
    console.log('💾 localStorage authToken:', localStorage.getItem('authToken'));
    console.log('💾 localStorage user:', localStorage.getItem('user'));
    console.log('👑 isHR:', this.isHR());
    console.log('👨‍💼 isHRManager:', this.isHRManager());
    console.log('👤 isEmployee:', this.isEmployee());
    console.log('📋 canViewEmployeeList:', this.canViewEmployeeList());
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  private getStoredUserRoles(): string[] {
    const user = this.getUser();
    return user?.roles || [];
  }

  private handleError(error: any) {
    console.error('❌ Erreur AuthService:', error);
    let errorMessage = 'Une erreur est survenue!';

    if (error.status === 401) {
      errorMessage = 'Email ou mot de passe incorrect.';
    } else if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur.';
    }

    return throwError(() => errorMessage);
  }
}
