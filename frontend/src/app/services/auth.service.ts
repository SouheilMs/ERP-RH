import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
  token: string;
}

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8081/api/auth';
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  signup(signupRequest: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, signupRequest, httpOptions)
      .pipe(catchError(this.handleError));
  }

  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/signin`, loginRequest, httpOptions)
      .pipe(
        tap(response => {
          this.saveUserToStorage(response);
          this.setCurrentUser(response);
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(userData: JwtResponse): void {
    const currentUser: CurrentUser = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      roles: userData.roles,
      token: userData.accessToken
    };
    this.currentUserSubject.next(currentUser);
  }

  getCurrentUserId(): string | null {
    return this.currentUserSubject.value?.id || null;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !user.roles) return false;

    return user.roles.some(r =>
      r.toLowerCase() === role.toLowerCase() ||
      r.toLowerCase() === `role_${role.toLowerCase()}`
    );
  }

  isAdmin(): boolean {
    return this.hasRole('HRMANAGER') || this.hasRole('ROLE_HRMANAGER');
  }

  isHR(): boolean {
    return this.hasRole('HR') || this.hasRole('ROLE_HR');
  }

  isManager(): boolean {
    return this.isHR() || this.isAdmin();
  }

  isEmployee(): boolean {
    return this.hasRole('EMPLOYEE') || this.hasRole('ROLE_EMPLOYEE');
  }

  private saveUserToStorage(response: JwtResponse): void {
    localStorage.setItem('authToken', response.accessToken);

    const currentUser: CurrentUser = {
      id: response.id,
      username: response.username,
      email: response.email,
      roles: response.roles,
      token: response.accessToken
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return;

    try {
      const user: CurrentUser = JSON.parse(userJson);
      this.currentUserSubject.next(user);
    } catch {
      this.logout();
    }
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Server error';
    if (error.status === 401) message = 'Invalid email or password';
    if (error.status === 0) message = 'Cannot connect to server';

    console.error('HTTP ERROR:', error);
    return throwError(() => message);
  }
}
