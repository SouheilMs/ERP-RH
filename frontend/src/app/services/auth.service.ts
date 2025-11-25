import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  currentUser$: any;

  constructor(private http: HttpClient, private router: Router) {}

  signup(signupRequest: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, signupRequest)
      .pipe(
        catchError(this.handleError)
      );
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
  return this.http.post<JwtResponse>(`${this.apiUrl}/signin`, loginRequest)
    .pipe(
      tap((response: JwtResponse) => {
      // Store token and user info
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.id, // Make sure this contains the actual user ID
        username: response.username,
        email: response.email,
        roles: response.roles
      }));
      this.isLoggedInSubject.next(true);
    }),
    catchError(this.handleError)
  );
}
getCurrentUserId(): string {
  const user = this.getUser();
  return user?.id;
}

  resetPassword(resetRequest: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, resetRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): void {
    // Clear stored data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getAuthStatus(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || error.message || 'Server error';
    }
    return throwError(errorMessage);
  }
}