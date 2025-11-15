import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
    } else if (error.status === 404) {
      errorMessage = 'API non trouvée. Vérifiez les endpoints du backend.';
    } else if (error.status === 400) {
      // Gérer les erreurs de validation du backend
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = 'Données invalides';
      }
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // READ - Récupérer tous les rôles
  getAllRoles(): Observable<Role[]> {
    console.log(' FETCHING ROLES FROM API');
    return this.http.get<Role[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // CREATE - Créer un nouveau rôle
  createRole(roleName: string): Observable<Role> {
    console.log(' CREATING ROLE:', roleName);
    const roleDTO: RoleDTO = { roleName };
    return this.http.post<Role>(this.apiUrl, roleDTO)
      .pipe(catchError(this.handleError));
  }

  // UPDATE - Mettre à jour un rôle
  updateRole(id: string, roleName: string): Observable<Role> {
    console.log(' UPDATING ROLE:', id, roleName);
    const roleDTO: RoleDTO = { roleName };
    return this.http.put<Role>(`${this.apiUrl}/${id}`, roleDTO)
      .pipe(catchError(this.handleError));
  }

  // DELETE - Supprimer un rôle par ID
  deleteRole(id: string): Observable<string> {
    console.log(' DELETING ROLE:', id);
    return this.http.delete(`${this.apiUrl}/${id}`, { 
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  // GET - Récupérer un rôle par ID
  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // GET - Vérifier si un rôle existe
  roleExists(roleName: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${roleName}`)
      .pipe(catchError(this.handleError));
  }

  // DELETE - Supprimer tous les rôles
  deleteAllRoles(): Observable<string> {
    return this.http.delete(this.apiUrl, { 
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }
}