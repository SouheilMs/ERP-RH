import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Type inline pour Employee
export interface Employee {
  id: string;
  username: string;
  email: string;
  phone: string;
  salary: number;
  status: string;
  hireDate: string; // string pour Angular date
  photoUrl?: string; // optionnelle
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeServices {
  private apiUrl = 'http://localhost:8081/api/employees'; // Vérifie le port

  constructor(private http: HttpClient) {}

  // Liste tous les employés
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // Détail d’un employé par ID
  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour un employé par ID
  updateEmployeeById(id: string, employeeData: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employeeData);
  }

  // Supprimer un employé
  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Télécharger une photo pour un employé
  uploadPhoto(id: string, fileData: FormData): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/${id}/upload-photo`, fileData);
  }
  //Expoter
  exportEmployeesToExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }
  //Importer
  importEmployeesFromExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/import`, formData, { responseType: 'text' });
  }


}
