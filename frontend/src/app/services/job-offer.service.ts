import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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

  private handleError(error: HttpErrorResponse) {
    console.error('🔴 API Error:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Erreur ${error.status}: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  createJobOffer(request: JobOfferRequest, publisherId: string): Observable<JobOffer> {
    const params = new HttpParams().set('publisherId', publisherId);
    
    console.log('🟡 Creating job offer:', request);
    
    return this.http.post<JobOffer>(this.apiUrl, request, { params })
      .pipe(
        tap(response => console.log('🟢 Create successful:', response)),
        catchError(this.handleError)
      );
  }

  getJobOfferById(id: string): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getAllJobOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  updateJobOffer(id: string, request: JobOfferRequest): Observable<JobOffer> {
    console.log('🟡 Updating job offer:', { id, request });
    
    return this.http.put<JobOffer>(`${this.apiUrl}/${id}`, request)
      .pipe(
        tap(response => console.log('🟢 Update successful:', response)),
        catchError(this.handleError)
      );
  }

  deleteJobOffer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  publishJobOffer(id: string): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.apiUrl}/${id}/publish`, {})
      .pipe(catchError(this.handleError));
  }

  closeJobOffer(id: string): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.apiUrl}/${id}/close`, {})
      .pipe(catchError(this.handleError));
  }

  searchJobOffers(keyword: string): Observable<JobOffer[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<JobOffer[]>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  getJobOffersByStatus(status: string): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  getActiveJobOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/active`)
      .pipe(catchError(this.handleError));
  }

  testBackendConnection(): Observable<any> {
    return this.http.get(this.apiUrl)
      .pipe(catchError(this.handleError));
  }
}