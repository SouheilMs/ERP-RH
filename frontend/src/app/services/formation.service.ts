import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Formation {
  id: string;
  title: string;
  description: string;
  location: string;
  formateur: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  certificateId: string;
  status: 'PLANIFIED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  participants: string[];
  cost: number;
  category: string;
  skills: string;
  currentParticipants: number;
}

export interface FormationRequest {
  title: string;
  description: string;
  location: string;
  formateur: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  cost: number;
  category: string;
  skills: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = 'http://localhost:8081/api/formations';

  constructor(private http: HttpClient) { }

  createFormation(request: FormationRequest, createdById: string): Observable<Formation> {
    const params = new HttpParams().set('createdById', createdById);
    return this.http.post<Formation>(this.apiUrl, request, { params });
  }

  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl);
  }

  getFormationById(id: string): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/${id}`);
  }

  updateFormation(id: string, request: FormationRequest): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/${id}`, request);
  }

  deleteFormation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  startFormation(id: string): Observable<Formation> {
    return this.http.post<Formation>(`${this.apiUrl}/${id}/start`, {});
  }

  completeFormation(id: string): Observable<Formation> {
    return this.http.post<Formation>(`${this.apiUrl}/${id}/complete`, {});
  }

  cancelFormation(id: string): Observable<Formation> {
    return this.http.post<Formation>(`${this.apiUrl}/${id}/cancel`, {});
  }

  addParticipant(formationId: string, employeeId: string): Observable<Formation> {
    return this.http.post<Formation>(`${this.apiUrl}/${formationId}/participants/${employeeId}`, {});
  }

  removeParticipant(formationId: string, employeeId: string): Observable<Formation> {
    return this.http.delete<Formation>(`${this.apiUrl}/${formationId}/participants/${employeeId}`);
  }

  getFormationsByParticipant(employeeId: string): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/participant/${employeeId}`);
  }

  getFormationsByStatus(status: string): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/status/${status}`);
  }

  getFormationsByCategory(category: string): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/category/${category}`);
  }

  searchFormations(keyword: string): Observable<Formation[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Formation[]>(`${this.apiUrl}/search`, { params });
  }

  getUpcomingFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/upcoming`);
  }

  getFormationCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/count`);
  }
}