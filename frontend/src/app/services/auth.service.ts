import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
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
  token: string;
  type: string;
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
    // Initial debug log
  }

  // Méthodes d'authentification
  signup(signupRequest: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, signupRequest)
     .pipe(catchError(error => throwError(() => error)));
  }

canViewFormations(): boolean {
  return this.isHR() || this.isHRManager();
}

login(loginRequest: LoginRequest): Observable<JwtResponse> {

  return this.http.post<JwtResponse>(`${this.apiUrl}/signin`, loginRequest)
    .pipe(
      tap((response: JwtResponse) => {

        if (response.token) {  
          localStorage.setItem('authToken', response.token);

          const userData = {
            id: response.id,
            username: response.username,
            email: response.email,
            roles: response.roles
          };
          localStorage.setItem('user', JSON.stringify(userData));

          this.isLoggedInSubject.next(true);
          this.userRolesSubject.next(response.roles);

          this.decodeToken();
        } else {
          throw new Error('No token received');
        }
      }),
      catchError(error => throwError(() => error))
    );
}
  resetPassword(resetRequest: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, resetRequest)
     .pipe(catchError(error => throwError(() => error)));
  }

  logout(): void {

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
    this.userRolesSubject.next([]);
    this.router.navigate(['/login']);
  }

  // ================= MÉTHODES POUR GÉRER LES RÔLES ET PERMISSIONS =================

  getUserRole(): string {
    const user = this.getUser();
    return user?.roles?.[0] || '';
  }

  getUserRoles(): string[] {
    const user = this.getUser();
    return user?.roles || [];
  }


// Dans AuthService, modifiez getCurrentUserId()
getCurrentUserId(): string | null {
  const user = this.getUser();

  if (user && user.id) {
    return user.id;
  }
  return null;
}

// Et dans getUser()
getUser(): any {
  const userJson = localStorage.getItem('user');
  try {
    const user = userJson ? JSON.parse(userJson) : null;
    return user;

  } catch (error) {
    return null;
  }
}
  //  Méthodes de vérification de rôle plus précises
 isHR(): boolean {
  const roles = this.getUserRoles();
  const isHR = roles.includes('ROLE_HR');
  return isHR;
}

  isHRManager(): boolean {
  const roles = this.getUserRoles();
  const isHRManager = roles.includes('ROLE_HRMANAGER');
  return isHRManager;
}

  isEmployee(): boolean {
    return this.getUserRoles().includes('ROLE_EMPLOYEE');
  }

  //Vérifier si c'est RH ou Manager
  isHRorManager(): boolean {
    return this.isHR() || this.isHRManager();
  }

  // Vérifier si l'utilisateur peut accéder au dashboard
  canAccessDashboard(): boolean {
    return this.isHRorManager();
  }

  // Vérifier si l'utilisateur peut voir la liste des employés
  canViewEmployeeList(): boolean {
    return this.isHRorManager();
  }

  //  Vérifier si l'utilisateur peut voir les offres d'emploi
  canViewJobs(): boolean {
    return this.isHRorManager();
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return requiredRoles.some(role => userRoles.includes(role));
  }

  hasAllRoles(requiredRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return requiredRoles.every(role => userRoles.includes(role));
  }

  // ================= MÉTHODES POUR LA GESTION DES PERMISSIONS =================

  canAccessEmployeeProfile(employeeId: string): boolean {
    const currentUserId = this.getCurrentUserId();
    const isHRorManager = this.isHRorManager();
    const isOwnProfile = currentUserId === employeeId;

    return isHRorManager || isOwnProfile;
  }

  // Vérifier si l'utilisateur peut voir l'historique des fiches de paie
  canViewPayslipHistory(employeeId: string): boolean {
    const currentUserId = this.getCurrentUserId();
    const isHRorManager = this.isHRorManager();
    const isOwnProfile = currentUserId === employeeId;

    return isHRorManager || isOwnProfile;
  }

  // Vérifier si l'utilisateur peut générer des fiches de paie
  canGeneratePayslip(employeeId: string): boolean {
    const currentUserId = this.getCurrentUserId();
    const isHRorManager = this.isHRorManager();
    const isOwnProfile = currentUserId === employeeId;

    // Les RH peuvent générer pour tous, les employés seulement pour eux-mêmes
    return isHRorManager || isOwnProfile;
  }

  canEditEmployeeProfile(employeeId: string): boolean {
    // SEULS LES RH PEUVENT ÉDITER LES PROFILS (pas leur propre profil via l'interface admin)
    const currentUserId = this.getCurrentUserId();
    const isHRorManager = this.isHRorManager();
    const isOwnProfile = currentUserId === employeeId;

    // Les RH peuvent éditer tous les profils sauf le leur via l'interface admin
    // Les employés ne peuvent éditer que leur propre profil via "Mon Profil"
    const canEdit = isHRorManager && !isOwnProfile;
    return canEdit;
  }

  canUploadEmployeePhoto(employeeId: string): boolean {
    // SEULS LES RH PEUVENT UPLOADER DES PHOTOS
    const currentUserId = this.getCurrentUserId();
    const isHRorManager = this.isHRorManager();
    const isOwnProfile = currentUserId === employeeId;

    const canUpload = isHRorManager && !isOwnProfile;
    return canUpload;
  }

  //  Vérifier si l'utilisateur peut créer/modifier des offres d'emploi
  canManageJobs(): boolean {
    return this.isHRorManager();
  }

  // ================= GETTERS BASIQUES =================

  getToken(): string | null {
    const token = localStorage.getItem('authToken');
    return token;
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

  // ================= MÉTHODES DE DEBUG =================


  decodeToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
      } catch (error) {
        console.error(' Error decoding token:', error);
      }
    }
  }

  // ================= MÉTHODES PRIVÉES =================

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  private getStoredUserRoles(): string[] {
    const user = this.getUser();
    return user?.roles || [];
  }

}
