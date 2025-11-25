import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import {map, Observable, of, throwError} from 'rxjs';
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

  // Informations fiche de paie tunisienne
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

  // Ancienneté et primes
  seniorityBonus?: number;
  yearsOfService?: number;
  monthsOfService?: number;
  bonusPeriods?: number;
  traditionalSeniorityBonus?: number;
  nineDinarsBonus?: number;
  seniorityBlocks?: number;

  // Rôles et formations
  roleNames?: string[];
  formations?: Formation[];
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

  // Méthode utilitaire pour créer les headers avec le token
  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('authToken');
    console.log('🔐 Creating auth headers with token:', token ? 'PRESENT' : 'NULL');

    if (token) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    return {};
  }

  // ================= EMPLOYEE =================
  getAllEmployees(): Observable<Employee[]> {
    console.log('🔄 getAllEmployees - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.get<Employee[]>(this.apiUrl, { headers }).pipe(
      tap((employees) => console.log('✅ getAllEmployees SUCCESS with manual auth - Count:', employees?.length || 0)),
      catchError(error => {
        console.error('❌ getAllEmployees FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  getEmployeeById(id: string): Observable<Employee> {
    console.log('🔄 getEmployeeById - Adding manual auth headers for ID:', id);
    const headers = this.getAuthHeaders();

    return this.http.get<Employee>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap((employee) => console.log('✅ getEmployeeById SUCCESS with manual auth - Employee:', employee?.username)),
      catchError(error => {
        console.error('❌ getEmployeeById FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Génère les fiches de paie pour toute une année
   */
  generatePayslipsForYear(employeeId: string, year: number): Observable<any> {
    console.log('🔄 generatePayslipsForYear - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.post<any>(
      `${this.apiUrl}/${employeeId}/payslips/generate-year?year=${year}`,
      {},
      { headers }
    ).pipe(
      tap(result => {
        console.log('✅ generatePayslipsForYear SUCCESS:', result);
      }),
      catchError(error => {
        console.error('❌ generatePayslipsForYear FAILED:', error);
        return of({ successCount: 0, errorCount: 12, error: error.message });
      })
    );
  }

  // CORRECTION : Méthode pour générer des fiches de test
  generateTestPayslips(employeeId: string): Observable<any> {
    console.log('🔄 generateTestPayslips - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.post<any>(
      `${this.apiUrl}/${employeeId}/payslips/generate-test`,
      {},
      { headers }
    ).pipe(
      tap(result => {
        console.log('✅ generateTestPayslips SUCCESS:', result);
      }),
      catchError(error => {
        console.error('❌ generateTestPayslips FAILED:', error);
        return of({
          count: 0,
          message: 'Erreur lors de la génération des fiches de test',
          error: error.message
        });
      })
    );
  }

  createEmployee(employee: Employee): Observable<Employee> {
    console.log('🔄 createEmployee - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.post<Employee>(`${this.apiUrl}/Add-employee`, employee, { headers }).pipe(
      tap((newEmployee) => console.log('✅ createEmployee SUCCESS with manual auth - New ID:', newEmployee?.id)),
      catchError(error => {
        console.error('❌ createEmployee FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  updateEmployeeById(id: string, data: Employee): Observable<Employee> {
    console.log('🔄 updateEmployeeById - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.put<Employee>(`${this.apiUrl}/${id}`, data, { headers }).pipe(
      tap((updatedEmployee) => console.log('✅ updateEmployeeById SUCCESS with manual auth - Updated:', updatedEmployee?.username)),
      catchError(error => {
        console.error('❌ updateEmployeeById FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  deleteEmployee(id: string): Observable<any> {
    console.log('🔄 deleteEmployee - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text',
      headers
    }).pipe(
      tap(() => console.log('✅ deleteEmployee SUCCESS with manual auth')),
      catchError(error => {
        console.error('❌ deleteEmployee FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  // ================= PHOTO =================
  getEmployeePhoto(id: string): string {
    const photoUrl = `${this.apiUrl}/${id}/photo`;
    console.log('📸 Generated photo URL (NO AUTH):', photoUrl);
    return photoUrl;
  }

  // Méthode pour récupérer la photo avec authentification (si nécessaire)
  getEmployeePhotoBlob(id: string): Observable<Blob> {
    console.log('🔄 getEmployeePhotoBlob - Trying with auth headers');
    const headers = this.getAuthHeaders();

    return this.http.get(`${this.apiUrl}/${id}/photo`, {
      responseType: 'blob',
      headers
    }).pipe(
      tap(() => console.log('✅ getEmployeePhotoBlob SUCCESS with auth')),
      catchError(error => {
        console.log('🔄 getEmployeePhotoBlob with auth failed, trying without auth...');
        // Si l'authentification échoue, essayer sans auth
        return this.http.get(`${this.apiUrl}/${id}/photo`, {
          responseType: 'blob'
        }).pipe(
          tap(() => console.log('✅ getEmployeePhotoBlob SUCCESS without auth')),
          catchError(error2 => {
            console.error('❌ getEmployeePhotoBlob FAILED both with and without auth:', error2);
            // Retourner une image par défaut
            return this.getDefaultProfileImage();
          })
        );
      })
    );
  }

  // Méthode pour obtenir une image par défaut
  private getDefaultProfileImage(): Observable<Blob> {
    return this.http.get('assets/default-profile.png', {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('❌ Even default image failed:', error);
        // Créer un blob vide comme fallback ultime
        return of(new Blob());
      })
    );
  }

  uploadPhoto(id: string, formData: FormData): Observable<Employee> {
    console.log('🔄 uploadPhoto - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.post<Employee>(`${this.apiUrl}/${id}/upload-photo`, formData, { headers }).pipe(
      tap((employee) => console.log('✅ uploadPhoto SUCCESS with manual auth - Photo updated for:', employee?.username)),
      catchError(error => {
        console.error('❌ uploadPhoto FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  // ================= FORMATION =================
  addFormation(employeeId: string, formData: FormData): Observable<Formation> {
    console.log('🔄 addFormation - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.post<Formation>(`${this.apiUrl}/${employeeId}/formations`, formData, { headers }).pipe(
      tap((formation) => console.log('✅ addFormation SUCCESS with manual auth - New formation:', formation?.name)),
      catchError(error => {
        console.error('❌ addFormation FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  getFormationCertificate(certificateId: string): string {
    const certificateUrl = `${this.apiUrl}/formations/certificate/${certificateId}`;
    console.log('📄 Generated certificate URL:', certificateUrl);
    return certificateUrl;
  }

  deleteFormation(employeeId: string, formationId: string): Observable<any> {
    console.log('🔄 deleteFormation - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.delete(`${this.apiUrl}/${employeeId}/formations/${formationId}`, {
      responseType: 'text',
      headers
    }).pipe(
      tap(() => console.log('✅ deleteFormation SUCCESS with manual auth')),
      catchError(error => {
        console.error('❌ deleteFormation FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  getFormationCertificateBlob(certificateId: string): Observable<Blob> {
    console.log('🔄 getFormationCertificateBlob - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.get(`${this.apiUrl}/formations/certificate/${certificateId}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
        ...headers
      }
    }).pipe(
      tap(() => console.log('✅ getFormationCertificateBlob SUCCESS with manual auth')),
      catchError(error => {
        console.error('❌ getFormationCertificateBlob FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  // ================= PAYSLIP =================
  getPayslipPDF(employeeId: string): Observable<Blob> {
    console.log('🔄 getPayslipPDF - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.get(`${this.apiUrl}/${employeeId}/payslip`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
        ...headers
      }
    }).pipe(
      tap(() => console.log('✅ getPayslipPDF SUCCESS with manual auth')),
      catchError(error => {
        console.error('❌ getPayslipPDF FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  // ================= HISTORIQUE FICHES DE PAIE =================
  getEmployeePayslipsByYear(employeeId: string, year: number): Observable<Payslip[]> {
    console.log('🔄 getEmployeePayslipsByYear - Adding manual auth headers');
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('year', year.toString());

    return this.http.get<Payslip[]>(`${this.apiUrl}/${employeeId}/payslips/by-year`, { headers, params }).pipe(
      tap(payslips => {
        console.log(`✅ getEmployeePayslipsByYear SUCCESS: ${payslips?.length || 0} payslips`);
      }),
      catchError(error => {
        console.error(`❌ getEmployeePayslipsByYear FAILED:`, error);
        // Fallback : récupérer toutes les fiches et filtrer côté client
        return this.getEmployeePayslips(employeeId).pipe(
          map(allPayslips => {
            const filtered = allPayslips.filter(p => p.year === year);
            console.log(`🔄 Fallback - Fiches filtrées pour ${year}:`, filtered.length);
            return filtered;
          })
        );
      })
    );
  }

  // Méthode pour récupérer toutes les fiches
  getEmployeePayslips(employeeId: string): Observable<Payslip[]> {
    console.log('🔄 getEmployeePayslips - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.get<Payslip[]>(`${this.apiUrl}/${employeeId}/payslips`, { headers }).pipe(
      tap(payslips => {
        console.log('✅ getEmployeePayslips SUCCESS:', payslips?.length || 0, 'payslips');
      }),
      catchError(error => {
        console.error('❌ getEmployeePayslips FAILED:', error);
        return of([]);
      })
    );
  }

  // Méthode pour le téléchargement
  downloadHistoricalPayslip(payslipId: string): Observable<Blob> {
    console.log('🔄 downloadHistoricalPayslip - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.get(`${this.apiUrl}/payslips/${payslipId}/download`, {
      responseType: 'blob',
      headers
    }).pipe(
      tap(() => console.log(`✅ downloadHistoricalPayslip SUCCESS for ID: ${payslipId}`)),
      catchError(error => {
        console.error('❌ downloadHistoricalPayslip FAILED:', error);
        return of(new Blob());
      })
    );
  }

  // ================= GÉNÉRATION FICHE DE PAIE =================
  generatePayslipForMonth(employeeId: string, month: number, year: number): Observable<Payslip> {
    console.log('🔄 generatePayslipForMonth - Adding manual auth headers');
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.post<Payslip>(`${this.apiUrl}/${employeeId}/payslip/generate`, null, { headers, params }).pipe(
      tap(response => {
        console.log('✅ generatePayslipForMonth SUCCESS:', response);
      }),
      catchError(error => {
        console.error('❌ generatePayslipForMonth FAILED:', error);
        throw error;
      })
    );
  }

  getAvailableYears(employeeId: string): Observable<number[]> {
    console.log('🔄 getAvailableYears - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.get<number[]>(`${this.apiUrl}/${employeeId}/payslips/years`, { headers }).pipe(
      tap(years => console.log('✅ getAvailableYears SUCCESS:', years)),
      catchError(error => {
        console.error('❌ getAvailableYears FAILED:', error);
        const currentYear = new Date().getFullYear();
        return of([currentYear, currentYear - 1, currentYear - 2]);
      })
    );
  }

  // ================= EXPORT / IMPORT EXCEL =================
  exportEmployees(): Observable<Blob> {
    console.log('🔄 exportEmployees - Adding manual auth headers');
    const headers = this.getAuthHeaders();

    return this.http.get(`${this.apiUrl}/export`, {
      responseType: 'blob',
      headers
    }).pipe(
      tap(() => console.log('✅ exportEmployees SUCCESS with manual auth')),
      catchError(error => {
        console.error('❌ exportEmployees FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  downloadEmployeesExcel(): void {
    this.exportEmployees().subscribe({
      next: (res: Blob) => {
        saveAs(res, 'employees.xlsx');
        console.log('✅ downloadEmployeesExcel SUCCESS');
      },
      error: (err: any) => {
        console.error("❌ downloadEmployeesExcel FAILED:", err);
      }
    });
  }

  importEmployees(file: File): Observable<any> {
    console.log('🔄 importEmployees - Adding manual auth headers');
    const headers = this.getAuthHeaders();
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/import`, formData, { headers }).pipe(
      tap(() => console.log('✅ importEmployees SUCCESS with manual auth')),
      catchError(error => {
        console.error('❌ importEmployees FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  // ================= UTILITY METHODS =================

  // Méthode pour tester la connexion
  testConnection(): Observable<any> {
    console.log('🧪 Testing API connection...');
    const headers = this.getAuthHeaders();

    return this.http.get(`${this.apiUrl}/test`, { headers }).pipe(
      tap(() => console.log('✅ Connection test SUCCESS')),
      catchError(error => {
        console.error('❌ Connection test FAILED:', error);
        return throwError(() => error);
      })
    );
  }

  // Méthode pour vérifier l'état de l'authentification
  checkAuthStatus(): void {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    console.log('🔐 Auth Status Check:');
    console.log('  - Token:', token ? `PRESENT (${token.length} chars)` : 'NULL');
    console.log('  - User:', user ? 'PRESENT' : 'NULL');

    if (user) {
      try {
        const userObj = JSON.parse(user);
        console.log('  - User ID:', userObj.id);
        console.log('  - Username:', userObj.username);
        console.log('  - Roles:', userObj.roles);
      } catch (e) {
        console.log('  - User data malformed');
      }
    }
  }
}
