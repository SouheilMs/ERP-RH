import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {map, Observable, of} from 'rxjs';
import { saveAs } from 'file-saver';
import { catchError, tap } from 'rxjs/operators';

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
  employee?: Employee;

  username: string;
  email: string;
  phone?: string;
  salary?: number;
  status?: string;
  hireDate?: string;
  photoUrl?: string;
  photoId?: string;
  formations?: Formation[];

  // New fields for Tunisian payslip
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
  seniorityBonus?: number;
  yearsOfService?: number;
  monthsOfService?: number;
  bonusPeriods?: number;
  traditionalSeniorityBonus?: number;
  nineDinarsBonus?: number;
}

export interface Payslip {
  id: string;
  fileName: string;
  generationDate: string;
  period: string;
  month: number;
  year: number;
  netSalary: number;
  grossSalary: number;
  seniorityBonus?: number;
  yearsOfService?: number;
  monthsOfService?: number;
  bonusPeriods?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeServices {
  private apiUrl = 'http://localhost:8081/api/employees';

  constructor(private http: HttpClient) {}

  // ================= EMPLOYEE =================
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  /**
   * Génère les fiches de paie pour toute une année
   */
  generatePayslipsForYear(employeeId: string, year: number): Observable<any> {
    console.log(' Génération annuelle pour:', employeeId, 'année:', year);

    return this.http.post<any>(
      `${this.apiUrl}/${employeeId}/payslips/generate-year?year=${year}`,
      {}
    ).pipe(
      tap(result => {
        console.log(' Génération annuelle terminée:', result);
      }),
      catchError(error => {
        console.error(' Erreur génération annuelle:', error);
        return of({ successCount: 0, errorCount: 12, error: error.message });
      })
    );
  }

  // CORRECTION : Méthode pour générer des fiches de test
  generateTestPayslips(employeeId: string): Observable<any> {
    console.log(' Génération fiches de test pour:', employeeId);

    return this.http.post<any>(
      `${this.apiUrl}/${employeeId}/payslips/generate-test`,
      {}
    ).pipe(
      tap(result => {
        console.log(' Fiches de test générées:', result);
      }),
      catchError(error => {
        console.error(' Erreur génération fiches test:', error);
        return of({
          count: 0,
          message: 'Erreur lors de la génération des fiches de test',
          error: error.message
        });
      })
    );
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
    return `${this.apiUrl}/${id}/photo`;
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

  deleteFormation(employeeId: string, formationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${employeeId}/formations/${formationId}`, { responseType: 'text' });
  }

  getFormationCertificateBlob(certificateId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/formations/certificate/${certificateId}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
  }

  // ================= PAYSLIP =================
  getPayslipPDF(employeeId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${employeeId}/payslip`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
  }

  // ================= HISTORIQUE FICHES DE PAIE =================

  getEmployeePayslipsByYear(employeeId: string, year: number): Observable<Payslip[]> {
    const params = new HttpParams().set('year', year.toString());

    return this.http.get<Payslip[]>(`${this.apiUrl}/${employeeId}/payslips/by-year`, { params }).pipe(
      tap(payslips => {
        console.log(` Fiches reçues pour ${year}:`, payslips?.length || 0);
      }),
      catchError(error => {
        console.error(` Erreur chargement fiches pour ${year}:`, error);
        // Fallback : récupérer toutes les fiches et filtrer côté client
        return this.getEmployeePayslips(employeeId).pipe(
          map(allPayslips => {
            const filtered = allPayslips.filter(p => p.year === year);
            console.log(` Fallback - Fiches filtrées pour ${year}:`, filtered.length);
            return filtered;
          })
        );
      })
    );
  }

  // Méthode pour récupérer toutes les fiches
  getEmployeePayslips(employeeId: string): Observable<Payslip[]> {
    console.log(' Récupération de TOUTES les fiches pour:', employeeId);

    return this.http.get<Payslip[]>(`${this.apiUrl}/${employeeId}/payslips`).pipe(
      tap(payslips => {
        console.log(' Toutes les fiches reçues:', payslips?.length || 0);
      }),
      catchError(error => {
        console.error(' Erreur récupération toutes les fiches:', error);
        return of([]);
      })
    );
  }

  // Méthode pour le téléchargement
  downloadHistoricalPayslip(payslipId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/payslips/${payslipId}/download`, {
      responseType: 'blob'
    }).pipe(
      tap(() => console.log(` Téléchargement fiche ID: ${payslipId}`)),
      catchError(error => {
        console.error(' Erreur téléchargement fiche:', error);
        return of(new Blob());
      })
    );
  }

  /**
   * Génère une fiche de paie pour un mois spécifique
   */
  generatePayslipForMonth(employeeId: string, month: number, year: number): Observable<Payslip> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.post<Payslip>(`${this.apiUrl}/${employeeId}/payslip/generate`, null, { params }).pipe(
      tap(response => {
        console.log('Payslip generation successful:', response);
      }),
      catchError(error => {
        console.error('Error generating payslip:', error);
        throw error;
      })
    );
  }

  getAvailableYears(employeeId: string): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/${employeeId}/payslips/years`).pipe(
      catchError(error => {
        console.error('Error loading available years:', error);
        const currentYear = new Date().getFullYear();
        return of([currentYear, currentYear - 1, currentYear - 2]);
      })
    );
  }

  // ================= EXPORT / IMPORT EXCEL =================
  exportEmployees(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }

  downloadEmployeesExcel(): void {
    this.exportEmployees().subscribe({
      next: (res: Blob) => saveAs(res, 'employees.xlsx'),
      error: (err: any) => console.error("Excel export error:", err)
    });
  }

  importEmployees(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }
}
