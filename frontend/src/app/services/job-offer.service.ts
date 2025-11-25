// src/app/services/job-offer.service.ts - VERSION COMPLÈTE CORRIGÉE
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// 🔥 AJOUT : Interfaces manquantes
export interface JobOffer {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  contractType: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  status: string;
  publishedBy: string;
  publishedDate: string;
  closingDate: string;
  createdAt: string;
  updatedAt: string;
  linkedInPostId: string;
  externalPlatforms: string[];
  applicationCount: number;
  viewCount: number;
  tags: string[];
  experienceLevel: string;
  educationRequired: string;
  isActive: boolean;
}

export interface JobOfferRequest {
  title: string;
  description: string;
  department: string;
  location: string;
  contractType: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  closingDate: string;
  tags: string[];
  experienceLevel: string;
  educationRequired: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {
  private apiUrl = 'http://localhost:8081/api/job-offers';

  constructor(private http: HttpClient) { }

  // 🔥 CORRECTION CRITIQUE : Méthode pour créer les headers AVEC le token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    console.log('🔐 JobOfferService.getAuthHeaders - Token found:', token ? `PRESENT (${token.substring(0, 20)}...)` : 'NULL');
    
    if (token) {
      console.log('✅ Creating headers with Authorization Bearer token');
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    } else {
      console.log('❌ No token available - requests will fail with 401');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
  }

  // 🔥 CORRECTION : Mettez à jour TOUTES les méthodes pour utiliser getAuthHeaders()
  getAllJobOffers(): Observable<JobOffer[]> {
    console.log('🔄 JobOfferService.getAllJobOffers - Starting request with auth headers');
    const headers = this.getAuthHeaders();
    
    // Log pour vérifier
    console.log('📤 Headers being sent:', {
      hasAuth: headers.has('Authorization'),
      contentType: headers.get('Content-Type')
    });
    
    return this.http.get<JobOffer[]>(this.apiUrl, { headers })
      .pipe(
        tap(offers => {
          console.log('✅ JobOfferService.getAllJobOffers - SUCCESS, received:', offers?.length, 'offers');
        }),
        catchError(this.handleError)
      );
  }

  getJobOfferById(id: string): Observable<JobOffer> {
    const headers = this.getAuthHeaders();
    return this.http.get<JobOffer>(`${this.apiUrl}/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  createJobOffer(request: JobOfferRequest, publisherId: string): Observable<JobOffer> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('publisherId', publisherId);
    return this.http.post<JobOffer>(this.apiUrl, request, { headers, params })
      .pipe(catchError(this.handleError));
  }

  updateJobOffer(id: string, request: JobOfferRequest): Observable<JobOffer> {
    const headers = this.getAuthHeaders();
    return this.http.put<JobOffer>(`${this.apiUrl}/${id}`, request, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteJobOffer(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  publishJobOffer(id: string): Observable<JobOffer> {
    const headers = this.getAuthHeaders();
    return this.http.post<JobOffer>(`${this.apiUrl}/${id}/publish`, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  closeJobOffer(id: string): Observable<JobOffer> {
    const headers = this.getAuthHeaders();
    return this.http.post<JobOffer>(`${this.apiUrl}/${id}/close`, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  searchJobOffers(keyword: string): Observable<JobOffer[]> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<JobOffer[]>(`${this.apiUrl}/search`, { headers, params })
      .pipe(catchError(this.handleError));
  }

  getJobOffersByStatus(status: string): Observable<JobOffer[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<JobOffer[]>(`${this.apiUrl}/status/${status}`, { headers })
      .pipe(catchError(this.handleError));
  }

  getActiveJobOffers(): Observable<JobOffer[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<JobOffer[]>(`${this.apiUrl}/active`, { headers })
      .pipe(catchError(this.handleError));
  }

  testBackendConnection(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(this.apiUrl, { headers })
      .pipe(
        tap(() => console.log('✅ Backend connection test successful')),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ JobOfferService Error - Full details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message
    });
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.status === 401) {
      errorMessage = 'Non autorisé - Le token JWT est manquant ou invalide';
      console.log('🚨 401 Unauthorized - Vérifiez que le header Authorization est envoyé');
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé';
    } else if (error.status === 404) {
      errorMessage = 'Ressource non trouvée';
    } else if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}