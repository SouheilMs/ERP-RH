import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  id: number;
  username: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth'; // Adjust if backend port differs

  constructor(private http: HttpClient) {}

  signup(signupRequest: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, signupRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/signin`, loginRequest)
      .pipe(
        catchError(this.handleError)
      );
  }
  resetPassword(resetRequest: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, resetRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an error
      errorMessage = error.error.message || error.message;
    }
    return throwError(errorMessage);
  }
}
