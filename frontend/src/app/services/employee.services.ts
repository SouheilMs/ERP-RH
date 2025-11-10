import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeServices {
  private apiUrl = 'http://localhost:8081/api/employees'; // Vérifie le port

  constructor(private http: HttpClient) {}

  // Liste tous les employés
  getAllEmployees(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Détail d’un employé par ID
  getEmployeeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour un employé par ID
  updateEmployeeById(id: string, employeeData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, employeeData);
  }
}
