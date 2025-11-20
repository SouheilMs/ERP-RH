import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EmployeeServices, Employee, Formation } from '../../services/employee.services';
import jsPDF from 'jspdf';

// Define pipe directly in component
@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeUrlPipe],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  loading = true;
  errorMessage = '';
  successMessage = '';

  // Formation modal
  showFormationModal = false;
  newFormation: any = { name: '', location: '', startDate: '', endDate: '' };
  selectedCertificate: File | null = null;
  formationSuccessMessage = '';
  formationErrorMessage = '';

  // Photo
  selectedPhoto: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  // Payslip
  showPayslipModal = false;
  currentPdfUrl: string | null = null;
  payslipLoading = false;

  // Formation PDF
  showFormationPdfModal = false;
  currentFormationPdfUrl: string | null = null;
  currentFormationTitle: string = '';
  formationPdfLoading = false;

  // Confirmation modals
  showDeleteConfirmation = false;
  formationToDelete: string | undefined;
  showUpdateConfirmation = false;

  // Success modals
  showDeleteSuccess = false;
  showUploadSuccess = false;
  showUpdateSuccess = false;
  showFormationSuccess = false;

  // Error modal
  showErrorModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public employeeService: EmployeeServices
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getEmployee(id);
  }

  getEmployee(id: string) {
    this.loading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: (data: Employee) => {
        this.employee = data;
        this.loading = false;
        this.previewUrl = null;
      },
      error: () => {
        this.errorMessage = "Unable to retrieve employee";
        this.loading = false;
        this.showErrorModal = true;
      }
    });
  }

  getPhotoUrl(): string {
    if (this.previewUrl) return this.previewUrl as string;
    if (this.employee?.photoId) return this.employeeService.getEmployeePhoto(this.employee.id!);
    return 'assets/default-profile.png';
  }

  // ================= UPDATE EMPLOYEE WITH CONFIRMATION =================
  onUpdateSubmit(event: Event) {
    event.preventDefault();
    this.showUpdateConfirmation = true;
  }

  confirmUpdate() {
    this.showUpdateConfirmation = false;

    if (!this.employee?.id) return;

    const updatedData: Employee = {
      username: this.employee.username,
      email: this.employee.email,
      phone: this.employee.phone,
      salary: this.employee.salary,
      status: this.employee.status,
      hireDate: this.employee.hireDate,

      // New fields
      cin: this.employee.cin,
      cnssNumber: this.employee.cnssNumber,
      position: this.employee.position,
      address: this.employee.address,
      city: this.employee.city,
      matricule: this.employee.matricule,
      rib: this.employee.rib,
      bankName: this.employee.bankName,
      workingDays: this.employee.workingDays,
      actualWorkingDays: this.employee.actualWorkingDays,
      transportAllowance: this.employee.transportAllowance,
      familyAllowance: this.employee.familyAllowance,
      otherBonuses: this.employee.otherBonuses
    };

    this.employeeService.updateEmployeeById(this.employee.id, updatedData).subscribe({
      next: (data: Employee) => {
        this.employee = data;
        this.successMessage = 'Update successful!';
        this.showUpdateSuccess = true;
      },
      error: () => {
        this.errorMessage = 'Error during update.';
        this.showErrorModal = true;
      }
    });
  }

  cancelUpdate() {
    this.showUpdateConfirmation = false;
  }

  // ================= PHOTO UPLOAD =================
  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedPhoto = file;
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(file);
  }

  uploadPhoto() {
    if (!this.employee?.id || !this.selectedPhoto) return;

    const formData = new FormData();
    formData.append('file', this.selectedPhoto);

    this.employeeService.uploadPhoto(this.employee.id, formData).subscribe({
      next: (data: Employee) => {
        this.employee = data;
        this.selectedPhoto = null;
        this.successMessage = "Photo updated successfully!";
        this.showUploadSuccess = true;
      },
      error: () => {
        this.errorMessage = "Error uploading photo.";
        this.showErrorModal = true;
      }
    });
  }

  // ================= FORMATION MANAGEMENT =================
  // ================= DATE VALIDATION METHODS =================
  isValidFormationDates(): boolean {
    if (!this.newFormation.startDate || !this.newFormation.endDate) {
      return false;
    }

    const startDate = new Date(this.newFormation.startDate);
    const endDate = new Date(this.newFormation.endDate);
    const today = new Date();

    // Reset hours for accurate comparison
    today.setHours(0, 0, 0, 0);

    // Check if start date is not in future
    if (startDate > today) {
      this.formationErrorMessage = 'Start date cannot be in the future';
      return false;
    }

    // Check if start date is before or equal to end date
    if (startDate > endDate) {
      this.formationErrorMessage = 'Start date must be before or equal to end date';
      return false;
    }

    this.formationErrorMessage = '';
    return true;
  }

  validateStartDate() {
    if (this.newFormation.startDate && this.newFormation.endDate) {
      this.isValidFormationDates();
    }
  }

  validateEndDate() {
    if (this.newFormation.startDate && this.newFormation.endDate) {
      this.isValidFormationDates();
    }
  }

// Modifiez la méthode addFormation pour inclure la validation
  addFormation(event?: Event) {
    if (event) event.preventDefault();
    if (!this.employee?.id) return;

    // Validate dates before submitting
    if (!this.isValidFormationDates()) {
      return;
    }

    const formData = new FormData();
    formData.append('name', this.newFormation.name);
    formData.append('location', this.newFormation.location);
    formData.append('startDate', this.newFormation.startDate);
    formData.append('endDate', this.newFormation.endDate);
    if (this.selectedCertificate)
      formData.append('certificate', this.selectedCertificate, this.selectedCertificate.name);

    this.employeeService.addFormation(this.employee.id, formData).subscribe({
      next: (formation: Formation) => {
        if (!this.employee!.formations) this.employee!.formations = [];
        this.employee!.formations.push(formation);
        this.closeFormationModal();
        this.formationSuccessMessage = 'Formation added successfully!';
        this.showFormationSuccess = true;
      },
      error: () => {
        this.formationErrorMessage = 'Error adding formation.';
      }
    });
  }
  onCertificateSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedCertificate = file;
      this.formationErrorMessage = '';
    } else {
      this.selectedCertificate = null;
      this.formationErrorMessage = 'Please select a PDF file.';
    }
  }

  getMaxStartDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  resetFormationModal() {
    this.newFormation = { name: '', location: '', startDate: '', endDate: '' };
    this.selectedCertificate = null;
    this.formationSuccessMessage = '';
    this.formationErrorMessage = '';
  }

  closeFormationModal() {
    this.showFormationModal = false;
    this.resetFormationModal();
  }

  // ================= DELETE FORMATION WITH CONFIRMATION =================
  deleteFormation(formationId: string | undefined) {
    if (!formationId || !this.employee?.id) return;

    this.formationToDelete = formationId;
    this.showDeleteConfirmation = true;
  }

  confirmDelete() {
    if (!this.formationToDelete || !this.employee?.id) return;

    this.employeeService.deleteFormation(this.employee.id, this.formationToDelete).subscribe({
      next: () => {
        this.employee!.formations = this.employee!.formations?.filter((f: Formation) => f.id !== this.formationToDelete);
        this.successMessage = 'Formation deleted successfully!';
        this.showDeleteSuccess = true;
        this.closeDeleteConfirmation();
      },
      error: () => {
        this.errorMessage = 'Error deleting formation.';
        this.showErrorModal = true;
        this.closeDeleteConfirmation();
      }
    });
  }

  cancelDelete() {
    this.closeDeleteConfirmation();
  }

  closeDeleteConfirmation() {
    this.showDeleteConfirmation = false;
    this.formationToDelete = undefined;
  }

  // ================= VIEW FORMATION PDF =================
  viewFormationCertificate(formation: Formation) {
    if (!formation.certificateId) {
      alert('No certificate available for this formation');
      return;
    }

    this.formationPdfLoading = true;
    this.currentFormationTitle = `Certificate - ${formation.name}`;

    this.employeeService.getFormationCertificateBlob(formation.certificateId).subscribe({
      next: (pdfBlob: Blob) => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        this.currentFormationPdfUrl = pdfUrl;
        this.showFormationPdfModal = true;
        this.formationPdfLoading = false;
      },
      error: (err) => {
        console.error('Error loading formation PDF:', err);
        this.errorMessage = 'Unable to load certificate';
        this.showErrorModal = true;
        this.formationPdfLoading = false;
      }
    });
  }

  printFormationCertificate() {
    if (!this.currentFormationPdfUrl) return;

    const printWindow = window.open(this.currentFormationPdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  onFormationPdfLoad() {
    console.log('Formation PDF loaded successfully');
  }

  closeFormationPdfModal() {
    this.showFormationPdfModal = false;
    if (this.currentFormationPdfUrl) {
      URL.revokeObjectURL(this.currentFormationPdfUrl);
      this.currentFormationPdfUrl = null;
    }
  }

  downloadFormationCertificate() {
    if (!this.currentFormationPdfUrl || !this.currentFormationTitle) return;

    const link = document.createElement('a');
    link.href = this.currentFormationPdfUrl;
    link.download = `${this.currentFormationTitle}.pdf`;
    link.click();
  }

  // ================= PAYSLIP HISTORY =================
  viewPayslipHistory() {
    if (this.employee?.id) {
      this.router.navigate(['/employees', this.employee.id, 'payslip-history']);
    }
  }










  // ================= SUCCESS MODAL METHODS =================
  closeDeleteSuccess() {
    this.showDeleteSuccess = false;
  }

  closeUploadSuccess() {
    this.showUploadSuccess = false;
  }

  closeUpdateSuccess() {
    this.showUpdateSuccess = false;
  }

  closeFormationSuccess() {
    this.showFormationSuccess = false;
  }

  closeErrorModal() {
    this.showErrorModal = false;
    this.errorMessage = '';
  }
}
