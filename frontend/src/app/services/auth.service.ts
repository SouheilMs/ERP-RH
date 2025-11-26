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

canViewFormations(): boolean {
  return this.isHR() || this.isHRManager();
}
  // login(loginRequest: LoginRequest): Observable<JwtResponse> {
  //   return this.http.post<JwtResponse>(`${this.apiUrl}/signin`, loginRequest)
  //     .pipe(
  //       tap((response: JwtResponse) => {
  //         // Store token and user info
  //         localStorage.setItem('authToken', response.token);
  //         localStorage.setItem('user', JSON.stringify({
  //           id: response.id,
  //           username: response.username,
  //           email: response.email,
  //           roles: response.roles
  //         }));
  //         this.isLoggedInSubject.next(true);
  //       }),
  //       catchError(this.handleError)
  //     );
  // }

login(loginRequest: LoginRequest): Observable<JwtResponse> {
  console.log('🔄 Tentative de login vers:', `${this.apiUrl}/signin`);

  return this.http.post<JwtResponse>(`${this.apiUrl}/signin`, loginRequest)
    .pipe(
      tap((response: JwtResponse) => {
        console.log('✅ Réponse login reçue:', response);

        if (response.token) {  // ✅ CORRECTION : Utiliser "token" au lieu de "accessToken"
          // Stocker le token correctement
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

          console.log('🔐 Token stocké avec succès');
          console.log('👤 User ID:', response.id);
          console.log('🎯 Roles:', response.roles);
          
          // ✅ Débogage du token
          this.decodeToken();
        } else {
          console.error('❌ Pas de token dans la réponse');
          throw new Error('No token received');
        }
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
  console.log('🔍 getCurrentUserId - user data:', user);
  
  if (user && user.id) {
    console.log('✅ User ID found:', user.id);
    return user.id;
  }
  
  console.log('❌ User ID not found - user object:', user);
  return null;
}

// Et dans getUser()
getUser(): any {
  const userJson = localStorage.getItem('user');
  console.log('🔍 getUser - raw JSON from localStorage:', userJson);
  
  try {
    const user = userJson ? JSON.parse(userJson) : null;
    console.log('🔍 getUser - parsed user:', user);
    return user;
  } catch (error) {
    console.error('❌ Erreur parsing user data:', error);
    return null;
  }
}
  // ✅ CORRECTION : Méthodes de vérification de rôle plus précises
 isHR(): boolean {
  const roles = this.getUserRoles();
  const isHR = roles.includes('ROLE_HR');
  console.log('🔍 isHR() check:', { roles, isHR });
  return isHR;
}

  isHRManager(): boolean {
  const roles = this.getUserRoles();
  const isHRManager = roles.includes('ROLE_HRMANAGER');
  console.log('🔍 isHRManager() check:', { roles, isHRManager });
  return isHRManager;
}

  isEmployee(): boolean {
    return this.getUserRoles().includes('ROLE_EMPLOYEE');
  }

  // ✅ NOUVELLE MÉTHODE : Vérifier si c'est RH ou Manager
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

  // ✅ NOUVELLE MÉTHODE : Vérifier si l'utilisateur peut voir les offres d'emploi
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

    console.log('🔐 canAccessEmployeeProfile check:');
    console.log('   - Employee ID:', employeeId);
    console.log('   - Current User ID:', currentUserId);
    console.log('   - Is HR/Manager:', isHRorManager);
    console.log('   - Is Own Profile:', isOwnProfile);
    console.log('   - Result:', isHRorManager || isOwnProfile);

    return isHRorManager || isOwnProfile;
  }

  // Vérifier si l'utilisateur peut voir l'historique des fiches de paie
  canViewPayslipHistory(employeeId: string): boolean {
    const currentUserId = this.getCurrentUserId();
    const isHRorManager = this.isHRorManager();
    const isOwnProfile = currentUserId === employeeId;

    console.log('🔐 canViewPayslipHistory Check:');
    console.log('   - Employee ID:', employeeId);
    console.log('   - Current User ID:', currentUserId);
    console.log('   - isHR/Manager:', isHRorManager);
    console.log('   - isOwnProfile:', isOwnProfile);
    console.log('   - Result:', isHRorManager || isOwnProfile);

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

    console.log('🔐 canEditEmployeeProfile:');
    console.log('   - Employee ID:', employeeId);
    console.log('   - Current User ID:', currentUserId);
    console.log('   - Is HR/Manager:', isHRorManager);
    console.log('   - Is Own Profile:', isOwnProfile);
    console.log('   - Result:', canEdit);

    return canEdit;
  }

  canUploadEmployeePhoto(employeeId: string): boolean {
    // SEULS LES RH PEUVENT UPLOADER DES PHOTOS
    const currentUserId = this.getCurrentUserId();
    const isHRorManager = this.isHRorManager();
    const isOwnProfile = currentUserId === employeeId;

    const canUpload = isHRorManager && !isOwnProfile;

    console.log('🔐 canUploadEmployeePhoto:', canUpload);
    return canUpload;
  }

  // ✅ NOUVELLE MÉTHODE : Vérifier si l'utilisateur peut créer/modifier des offres d'emploi
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
debugCurrentUser(): void {
  console.log('🐛 DEBUG CURRENT USER:');
  console.log('  - Token:', this.getToken() ? 'PRESENT' : 'NULL');
  console.log('  - User:', this.getUser());
  console.log('  - Roles:', this.getUserRoles());
  console.log('  - isHR():', this.isHR());
  console.log('  - isHRManager():', this.isHRManager());
  console.log('  - isEmployee():', this.isEmployee());
}
  // ================= MÉTHODES DE DEBUG =================

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
    console.log('👥 isHRorManager:', this.isHRorManager());
    console.log('📋 canViewEmployeeList:', this.canViewEmployeeList());
    console.log('💼 canViewJobs:', this.canViewJobs());
    console.log('🛠️ canManageJobs:', this.canManageJobs());
  }

  decodeToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔓 Token payload:', payload);
        console.log('⏰ Token expiration:', new Date(payload.exp * 1000));
      } catch (error) {
        console.error('❌ Error decoding token:', error);
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

  private handleError(error: any) {
    console.error('❌ Erreur AuthService:', error);
    let errorMessage = 'Une erreur est survenue!';

    if (error.status === 401) {
      errorMessage = 'Email ou mot de passe incorrect.';
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé. Permissions insuffisantes.';
    } else if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => errorMessage);
  }
  debugLoginResponse(loginRequest: LoginRequest): void {
  console.log('🧪 DEBUG: Testing login response format');
  
  this.http.post<any>(`${this.apiUrl}/signin`, loginRequest).subscribe({
    next: (rawResponse) => {
      console.log('🔍 RAW LOGIN RESPONSE:', rawResponse);
      console.log('📋 Response keys:', Object.keys(rawResponse));
      console.log('🔐 Token field name:', 
        rawResponse.accessToken ? 'accessToken' : 
        rawResponse.token ? 'token' : 
        'UNKNOWN');
    },
    error: (error) => {
      console.error('❌ Debug login failed:', error);
    }
  });
}
}