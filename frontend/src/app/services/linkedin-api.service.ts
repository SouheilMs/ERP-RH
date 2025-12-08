import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  LinkedInAuthRequest,
  LinkedInAuthResponse,
  LinkedInTokenResponse,
  LinkedInPostResponse,
  LinkedInIntegrationStatus,
  LinkedInPost,
  LinkedInIntegration
} from '../models/linkedin.models';

@Injectable({
  providedIn: 'root'
})
export class LinkedInApiService {
  private apiUrl = 'http://localhost:8080/api/linkedin';
  private integrationStatus = new BehaviorSubject<LinkedInIntegrationStatus | null>(null);

  constructor(private http: HttpClient) {}

  // Authentification
  initiateAuth(request: LinkedInAuthRequest): Observable<LinkedInAuthResponse> {
    return this.http.post<LinkedInAuthResponse>(`${this.apiUrl}/auth/initiate`, request);
  }

  handleCallback(code: string, state: string): Observable<LinkedInTokenResponse> {
    return this.http.get<LinkedInTokenResponse>(`${this.apiUrl}/auth/callback`, {
      params: { code, state }
    });
  }

  refreshToken(refreshToken: string): Observable<LinkedInTokenResponse> {
    return this.http.post<LinkedInTokenResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken });
  }

  // Publication d'offres
  publishJobOffer(jobOfferId: string): Observable<LinkedInPostResponse> {
    return this.http.post<LinkedInPostResponse>(`${this.apiUrl}/job-offers/${jobOfferId}/publish`, {});
  }

  updateJobPost(jobOfferId: string): Observable<LinkedInPostResponse> {
    return this.http.put<LinkedInPostResponse>(`${this.apiUrl}/job-offers/${jobOfferId}`, {});
  }

  deleteJobPost(jobOfferId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/job-offers/${jobOfferId}/delete-post`);
  }

  // Statistiques
  getPostStatistics(postId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts/${postId}/stats`);
  }

  // État de l'intégration
  getIntegrationStatus(): Observable<LinkedInIntegrationStatus> {
    return this.http.get<LinkedInIntegrationStatus>(`${this.apiUrl}/integration/status`).pipe(
      tap(status => this.integrationStatus.next(status))
    );
  }

  // Posts publiés
  getPublishedPosts(): Observable<LinkedInPost[]> {
    return this.http.get<LinkedInPost[]>(`${this.apiUrl}/published-posts`);
  }

  // Gestion des intégrations
  getIntegrations(): Observable<LinkedInIntegration[]> {
    return this.http.get<LinkedInIntegration[]>(`${this.apiUrl}/integrations`);
  }

  saveIntegration(integration: LinkedInIntegration): Observable<LinkedInIntegration> {
    return this.http.post<LinkedInIntegration>(`${this.apiUrl}/integrations`, integration);
  }

  disableIntegration(integrationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/integrations/${integrationId}`);
  }

  // Synchronisation
  syncJobApplications(integrationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/integrations/${integrationId}/sync`, {});
  }

  // Observables pour l'état
  getIntegrationStatus$() {
    return this.integrationStatus.asObservable();
  }

  updateIntegrationStatus(status: LinkedInIntegrationStatus) {
    this.integrationStatus.next(status);
  }
}