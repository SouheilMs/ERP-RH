import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EmployeeServices, Employee, Formation } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';

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

  // Permissions
  canViewAllInfo: boolean = false;
  canEdit: boolean = false;
  isViewingOwnProfile: boolean = false;
  showUnauthorizedMessage: boolean = false;
  isMyProfilePage: boolean = false; // NOUVEAU: pour savoir si c'est la page "Mon Profil"

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
    public employeeService: EmployeeServices,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Vérifier si c'est la page "Mon Profil"
    this.isMyProfilePage = this.route.snapshot.data['isMyProfile'] || false;

    if (this.isMyProfilePage) {
      // Page "Mon Profil" - charger l'employé connecté
      const currentUser = this.authService.getUser();
      if (currentUser?.id) {
        this.getEmployee(currentUser.id);
        this.checkPermissions(currentUser.id);
      }
    } else {
      // Page détail classique - charger via l'ID URL
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.getEmployee(id);
        this.checkPermissions(id);
      }
    }
  }

  // MÉTHODE PERMISSIONS D'ACCÈS SELON RÔLE
  private checkPermissions(employeeId: string) {
    const currentUser = this.authService.getUser();

    // L'utilisateur voit-il son propre profil ?
    this.isViewingOwnProfile = currentUser?.id === employeeId;

    // HR et HR Manager peuvent tout voir et modifier
    this.canViewAllInfo = this.authService.isHR() || this.authService.isHRManager();

    // Peut éditer ? UNIQUEMENT les RH (les employés ne peuvent RIEN modifier sauf formations)
    this.canEdit = this.canViewAllInfo;

    console.log('🎯 Permissions vérifiées:');
    console.log('👤 ID profil demandé:', employeeId);
    console.log('👤 ID utilisateur connecté:', currentUser?.id);
    console.log('👀 Vue propre profil:', this.isViewingOwnProfile);
    console.log('🔓 Peut voir toutes infos:', this.canViewAllInfo);
    console.log('✏️ Peut éditer (RH seulement):', this.canEdit);
    console.log('📄 Page "Mon Profil":', this.isMyProfilePage);
    console.log('🎯 Rôle utilisateur:', this.authService.getUserRole());

    // Si un employé essaie de voir un profil qui n'est pas le sien, bloquer l'accès
    if (this.authService.isEmployee() && !this.isViewingOwnProfile && !this.isMyProfilePage) {
      console.log('🚫 Accès refusé: Employé essaie de voir un autre profil');
      this.showUnauthorizedMessage = true;
      this.loading = false;

      // Rediriger vers "Mon Profil" après 2 secondes
      setTimeout(() => {
        this.router.navigate(['/my-profile']);
      }, 3000);
    }
  }

  // MÉTHODE POUR SAVOIR SI ON PEUT VOIR LE FORMULAIRE DE MODIFICATION
  canSeeUpdateForm(): boolean {
    return this.canViewAllInfo && !this.isMyProfilePage; // Seulement les RH sur les pages détail
  }

  // MÉTHODE POUR SAVOIR SI ON PEUT UPLOADER UNE PHOTO
  canUploadPhoto(): boolean {
    return this.canViewAllInfo && !this.isMyProfilePage; // Seulement les RH sur les pages détail
  }

  // MÉTHODE POUR SAVOIR SI ON PEUT VOIR LES INFORMATIONS EN LECTURE SEULE
  canSeeReadonlyInfo(): boolean {
    return this.isMyProfilePage || !this.canViewAllInfo; // "Mon Profil" ou employé regardant son profil
  }

  getEmployee(id: string) {
    if (this.showUnauthorizedMessage) {
      return;
    }

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

  // ================= UPDATE EMPLOYEE (RH SEULEMENT) =================
  onUpdateSubmit(event: Event) {
    event.preventDefault();

    if (!this.canEdit) {
      this.errorMessage = "You don't have permission to edit this profile";
      this.showErrorModal = true;
      return;
    }

    this.showUpdateConfirmation = true;
  }

  confirmUpdate() {
    this.showUpdateConfirmation = false;

    if (!this.employee?.id || !this.canEdit) return;

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

  // ================= PHOTO UPLOAD (RH SEULEMENT) =================
  onPhotoSelected(event: any) {
    if (!this.canUploadPhoto()) {
      this.errorMessage = "You don't have permission to upload photos";
      this.showErrorModal = true;
      return;
    }

    const file = event.target.files[0];
    if (!file) return;
    this.selectedPhoto = file;
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(file);
  }

  uploadPhoto() {
    if (!this.employee?.id || !this.selectedPhoto || !this.canUploadPhoto()) return;

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

  // ================= FORMATION MANAGEMENT (TOUS LES UTILISATEURS) =================
  isValidFormationDates(): boolean {
    if (!this.newFormation.startDate || !this.newFormation.endDate) {
      return false;
    }

    const startDate = new Date(this.newFormation.startDate);
    const endDate = new Date(this.newFormation.endDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (startDate > today) {
      this.formationErrorMessage = 'Start date cannot be in the future';
      return false;
    }

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

  // ================= DELETE FORMATION (TOUS LES UTILISATEURS) =================
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

// Dans employee-detail.component.ts
  viewPayslipHistory() {
    if (this.employee?.id) {
      // Vérifier les permissions
      if (this.canViewAllInfo || this.isViewingOwnProfile) {
        this.router.navigate(['/employees', this.employee.id, 'payslips']);
      } else {
        this.errorMessage = "You don't have permission to view payslips";
        this.showErrorModal = true;
      }
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
