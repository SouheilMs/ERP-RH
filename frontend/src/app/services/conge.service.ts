import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CongeRequest {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface Conge {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: string;
  rejectionReason?: string;
  submissionDate: string;
  responseDate?: string;
  respondedBy?: string;
}

export interface CongeStatusUpdate {
  status: string;
  rejectionReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CongeService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  submitCongeRequest(employeeId: string, request: CongeRequest): Observable<Conge> {
    return this.http.post<Conge>(`${this.apiUrl}/conges/submit/${employeeId}`, request);
  }

  getEmployeeConges(employeeId: string): Observable<Conge[]> {
    return this.http.get<Conge[]>(`${this.apiUrl}/conges/employee/${employeeId}`);
  }

  getAllPendingConges(): Observable<Conge[]> {
    return this.http.get<Conge[]>(`${this.apiUrl}/conges/pending`);
  }

  getAllConges(): Observable<Conge[]> {
    return this.http.get<Conge[]>(`${this.apiUrl}/conges/all`);
  }

  getCongeById(congeId: string): Observable<Conge> {
    return this.http.get<Conge>(`${this.apiUrl}/conges/${congeId}`);
  }

  updateCongeStatus(congeId: string, managerId: string, statusUpdate: CongeStatusUpdate): Observable<Conge> {
    return this.http.put<Conge>(
      `${this.apiUrl}/conges/${congeId}/status?managerId=${managerId}`,
      statusUpdate
    );
  }

  deleteConge(congeId: string, employeeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/conges/${congeId}/employee/${employeeId}`, {
      responseType: 'text'
    });
  }

  getCongesByStatus(status: string): Observable<Conge[]> {
    return this.http.get<Conge[]>(`${this.apiUrl}/conges/status/${status}`);
  }
}
