import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeeServices, Employee } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { saveAs } from 'file-saver';
import { FormsModule } from '@angular/forms';
import { AddEmployeeComponent } from '../add-employee/add-employee.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AddEmployeeComponent
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  searchTerm: string = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  filteredEmployees: Employee[] = [];
  showAddModal = false;

  // ✅ Permission checking variables
  canAddEmployees = false;
  canViewEmployees = false;

  private employeeService = inject(EmployeeServices);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.checkPermissions();
    this.loadEmployees();
  }

  // ✅ Check user permissions
  private checkPermissions(): void {
    this.canAddEmployees = this.authService.isHRorManager();
    this.canViewEmployees = this.authService.canViewEmployeeList();

    console.log('🔐 EmployeeListComponent - Permissions checked:');
    console.log('   - canAddEmployees:', this.canAddEmployees);
    console.log('   - canViewEmployees:', this.canViewEmployees);
    console.log('   - User roles:', this.authService.getUserRoles());
    console.log('   - isHR:', this.authService.isHR());
    console.log('   - isHRManager:', this.authService.isHRManager());

    // If user doesn't have permissions, show message
    if (!this.canViewEmployees) {
      this.errorMessage = '❌ You do not have permissions to view the employee list.';
      const currentUserId = this.authService.getCurrentUserId();
      if (currentUserId) {
        console.log('🔄 Redirecting to personal profile');
        // this.router.navigate(['/employees', currentUserId]);
      }
    }
  }

  // Load employees
  loadEmployees(): void {
    // ✅ CHECK PERMISSIONS BEFORE LOADING
    if (!this.canViewEmployees) {
      this.errorMessage = '❌ You do not have permissions to view the employee list.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.employeeService.getAllEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees = data;
        this.filteredEmployees = [...this.employees];
        this.loading = false;
        this.cdr.detectChanges();
        console.log('✅ Employees loaded:', this.employees.length);
      },
      error: (err) => {
        console.error("❌ Retrieval error details:", err);

        // ✅ GESTION D'ERREUR AMÉLIORÉE
        if (err.status === 200 && err.error && typeof err.error === 'string') {
          // Le serveur retourne du texte au lieu du JSON
          console.error('❌ Server returned text instead of JSON');
          this.errorMessage = 'Format de réponse incorrect du serveur.';
        } else if (err.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          this.authService.logout();
        } else if (err.status === 403) {
          this.errorMessage = 'Accès refusé. Permissions insuffisantes.';
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur.';
        } else {
          this.errorMessage = 'Unable to retrieve the employee list.';
        }

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Filter employees
  filterEmployees(): void {
    if (!this.searchTerm) {
      this.filteredEmployees = [...this.employees];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredEmployees = this.employees.filter(emp =>
      emp.username?.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term) ||
      emp.position?.toLowerCase().includes(term) ||
      emp.phone?.toLowerCase().includes(term) ||
      emp.status?.toLowerCase().includes(term)
    );
  }

  // Open add modal
  openAddModal(): void {
    // ✅ CHECK PERMISSIONS BEFORE OPENING
    if (!this.canAddEmployees) {
      this.errorMessage = '❌ You do not have permissions to add employees.';
      console.warn('🚫 Attempt to add employee without permissions');
      return;
    }

    console.log('✅ Opening add employee modal - Permissions OK');
    this.showAddModal = true;
  }

  // Close add modal
  closeAddModal(): void {
    this.showAddModal = false;
  }

  // Handle successful employee addition
  onEmployeeAdded(): void {
    this.closeAddModal();
    this.loadEmployees();
    this.successMessage = "✅ Employee added successfully!";
    setTimeout(() => this.successMessage = '', 4000);
  }

  // Export Excel
  exportExcel(): void {
    if (!this.canAddEmployees) {
      this.errorMessage = '❌ You do not have permissions to export.';
      return;
    }

    this.employeeService.exportEmployees().subscribe({
      next: (blob: Blob) => {
        saveAs(blob, `employees_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.successMessage = "✅ Excel export successful!";
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        console.error("❌ Excel export error:", err);
        this.errorMessage = "❌ Error during Excel export.";
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  // Import Excel
  importExcel(event: any): void {
    if (!this.canAddEmployees) {
      this.errorMessage = '❌ You do not have permissions to import.';
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.errorMessage = '❌ Please select an Excel file (.xlsx or .xls)';
      event.target.value = '';
      return;
    }

    this.loading = true;
    this.employeeService.importEmployees(file).subscribe({
      next: (res) => {
        this.loadEmployees();
        this.successMessage = "✅ Import successful!";
        this.loading = false;
        setTimeout(() => this.successMessage = '', 4000);
        event.target.value = '';
      },
      error: (err) => {
        console.error("❌ Excel import error:", err);
        this.errorMessage = "❌ Error during import.";
        this.loading = false;
        setTimeout(() => this.errorMessage = '', 4000);
        event.target.value = '';
      }
    });
  }

  // Delete employee
  deleteEmployee(id: string | undefined): void {
    if (!id) return;

    if (!this.canAddEmployees) {
      this.errorMessage = '❌ You do not have permissions to delete employees.';
      return;
    }

    if (!confirm("Are you sure you want to delete this employee? This action is irreversible.")) {
      return;
    }

    this.loading = true;
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.employees = this.employees.filter(e => e.id !== id);
        this.filteredEmployees = this.filteredEmployees.filter(e => e.id !== id);
        this.loading = false;
        this.successMessage = "✅ Employee deleted successfully!";
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        console.error("❌ Deletion error:", err);
        this.loading = false;
        this.errorMessage = "❌ Unable to delete.";
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  trackByEmployeeId(index: number, emp: Employee): string {
    return emp.id!;
  }

  // ✅ New method to get status text
  getStatusText(status: string | undefined): string {
    if (!status) return 'Inactive';

    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive',
      'ON_LEAVE': 'On Leave',
      'TERMINATED': 'Terminated'
    };

    return statusMap[status] || status;
  }
}
