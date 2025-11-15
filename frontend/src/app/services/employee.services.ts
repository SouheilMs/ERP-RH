import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';

export interface Formation {
  id?: string;
  name: string;
  location?: string;
  startDate: string;
  endDate: string;
  certificateId?: string;
}

export interface Employee {
  id?: string;
  username: string;
  email: string;
  phone?: string;
  salary?: number;
  status?: string;
  hireDate?: string;
  photoUrl?: string;
  photoId?: string;
  formations?: Formation[];

  // Nouveaux champs pour fiche de paie tunisienne
  cin?: string;
  cnssNumber?: string;
  position?: string;
  address?: string;
  city?: string;
  matricule?: string;
  rib?: string;
  bankName?: string;
  workingDays?: number;
  actualWorkingDays?: number;
  transportAllowance?: number;
  familyAllowance?: number;
  otherBonuses?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeServices {
  private apiUrl = 'http://localhost:8081/api/employees';

  constructor(private http: HttpClient) {}

  // ================= EMPLOYÉ =================
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  // ================= BULLETIN DE PAIE =================
  downloadPayslip(employeeId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${employeeId}/payslip`, {
      responseType: 'blob',
    });
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/Add-employee`, employee);
  }

  updateEmployeeById(id: string, data: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, data);
  }

  deleteEmployee(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  // ================= PHOTO =================
  getEmployeePhoto(id: string): string {
    return `${this.apiUrl}/${id}/photo?t=${Date.now()}`;
  }

  uploadPhoto(id: string, formData: FormData): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/${id}/upload-photo`, formData);
  }

  // ================= FORMATION =================
  addFormation(employeeId: string, formData: FormData): Observable<Formation> {
    return this.http.post<Formation>(`${this.apiUrl}/${employeeId}/formations`, formData);
  }

  getFormationCertificate(certificateId: string): string {
    return `${this.apiUrl}/formations/certificate/${certificateId}`;
  }

  // ================= SUPPRESSION FORMATION =================
  deleteFormation(employeeId: string, formationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${employeeId}/formations/${formationId}`, { responseType: 'text' });
  }

  // ================= EXPORT / IMPORT EXCEL =================
  exportEmployees(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }

  downloadEmployeesExcel(): void {
    this.exportEmployees().subscribe({
      next: (res: Blob) => saveAs(res, 'employees.xlsx'),
      error: (err: any) => console.error("Erreur export Excel :", err)
    });
  }

  importEmployees(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }
}
