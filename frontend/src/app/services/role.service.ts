import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Import du service d'authentification

export interface Role {
  id: string;
  roleName: string;
}

export interface RoleDTO {
  roleName: string;
}

// Interface pour la réponse de l'API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:8081/api/roles';

  constructor(
    private http: HttpClient,
    private authService: AuthService // Injection du service d'authentification
  ) { }


  // Méthode pour créer les headers avec le token
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    console.log('Creating auth headers with token:', token ? 'PRESENT' : 'NULL');
    if (token) {
      console.log(' Token length:', token.length);
      console.log('Token start:', token.substring(0, 20) + '...');
    }

    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // READ - Récupérer tous les rôles
  getAllRoles(): Observable<Role[]> {
    console.log(' FETCHING ROLES FROM API');

    const headers = this.getAuthHeaders();
    console.log(' Headers to send:', headers);

    return this.http.get<Role[]>(this.apiUrl, { headers })
      .pipe(
        tap(roles => {
          console.log(' ROLES API SUCCESS - Count:', roles?.length || 0);
          console.log(' Roles received:', roles);
        }),
        catchError(error => {
  console.error('Erreur:', error);
  return throwError(() => error);
})
      );
  }

  // CREATE - Créer un nouveau rôle
  createRole(roleName: string): Observable<Role> {
    console.log(' CREATING ROLE:', roleName);

    const headers = this.getAuthHeaders();
    const roleDTO: RoleDTO = { roleName };

    return this.http.post<Role>(this.apiUrl, roleDTO, { headers })
      .pipe(
        tap(role => {
          console.log(' ROLE CREATED SUCCESS:', role);
        }),
       catchError(error => {
  console.error('Erreur:', error);
  return throwError(() => error);
})
      );
  }

  // UPDATE - Mettre à jour un rôle
  updateRole(id: string, roleName: string): Observable<Role> {

    const headers = this.getAuthHeaders();
    const roleDTO: RoleDTO = { roleName };

    return this.http.put<Role>(`${this.apiUrl}/${id}`, roleDTO, { headers })
      .pipe(
        tap(role => {
          console.log('ROLE UPDATED SUCCESS:', role);
        }),
       catchError(error => {
  console.error('Erreur:', error);
  return throwError(() => error);
})
      );
  }

  // DELETE - Supprimer un rôle par ID
  deleteRole(id: string): Observable<string> {

    const headers = this.getAuthHeaders();

    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text',
      headers
    }).pipe(
      tap(response => {
        console.log(' ROLE DELETED SUCCESS:', response);
      }),
      catchError(error => {
  console.error('Erreur:', error);
  return throwError(() => error);
})
    );
  }

  // GET - Récupérer un rôle par ID
  getRoleById(id: string): Observable<Role> {

    const headers = this.getAuthHeaders();

    return this.http.get<Role>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        tap(role => {
          console.log(' ROLE BY ID SUCCESS:', role);
        }),
        catchError(error => {
  console.error('Erreur:', error);
  return throwError(() => error);
})
      );
  }

  // GET - Récupérer un rôle par nom
  getRoleByName(roleName: string): Observable<Role> {

    const headers = this.getAuthHeaders();

    return this.http.get<Role>(`${this.apiUrl}/name/${roleName}`, { headers })
      .pipe(
        tap(role => {
          console.log(' ROLE BY NAME SUCCESS:', role);
        }),
        catchError(error => {
  console.error('Erreur:', error);
  return throwError(() => error);
})
      );
  }

  // GET - Vérifier si un rôle existe
  roleExists(roleName: string): Observable<boolean> {

    const headers = this.getAuthHeaders();

    return this.http.get<boolean>(`${this.apiUrl}/exists/${roleName}`, { headers })
      .pipe(
        tap(exists => {
          console.log(' ROLE EXISTS CHECK SUCCESS:', exists);
        }),
       catchError(error => {
  console.error('Erreur:', error);
  return throwError(() => error);
})
      );
  }

  // DELETE - Supprimer tous les rôles
  deleteAllRoles(): Observable<string> {
    const headers = this.getAuthHeaders();

    return this.http.delete(this.apiUrl, {
      responseType: 'text',
      headers
    }).pipe(
      tap(response => {
        console.log(' ALL ROLES DELETED SUCCESS:', response);
      }),
     catchError(error => {
  console.error('Erreur:', error);
  return throwError(() => error);
})
    );
  }


}
