import { Component, OnInit, OnDestroy, Pipe, PipeTransform } from '@angular/core';
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
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  employee: Employee | null = null;
  loading = true;
  errorMessage = '';
  successMessage = '';

  // Permissions - CORRIGÉES
  canViewAllInfo = false;
  canEdit = false;
  isViewingOwnProfile = false;
  showUnauthorizedMessage = false;
  isMyProfilePage = false;

  // Formation modal
  showFormationModal = false;
  newFormation: any = { name: '', location: '', startDate: '', endDate: '' };
  selectedCertificate: File | null = null;
  formationSuccessMessage = '';
  formationErrorMessage = '';

  // Photo
  selectedPhoto: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  photoLoading = false;
  isUploadingPhoto = false;
  isUpdatingEmployee = false;

  // Payslip
  showPayslipModal = false;
  currentPdfUrl: string | null = null;
  payslipLoading = false;

  // Formation PDF
  showFormationPdfModal = false;
  currentFormationPdfUrl: string | null = null;
  currentFormationTitle = '';
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

  // Variables pour les erreurs de validation
  phoneError = '';
  salaryError = '';
  positionError = '';
  hireDateError = '';
  addressError = '';

  // Variables pour la validation des dates de formation
  startDateError = '';
  endDateError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public employeeService: EmployeeServices,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isMyProfilePage = this.route.snapshot.data['isMyProfile'] || false;

    if (this.isMyProfilePage) {
      const currentUser = this.authService.getUser();
      if (currentUser?.id) {
        this.getEmployee(currentUser.id);
        this.checkPermissions(currentUser.id);
      } else {
        this.router.navigate(['/login']);
      }
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.getEmployee(id);
        this.checkPermissions(id);
      } else {
        this.router.navigate(['/employees']);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.previewUrl && this.previewUrl.toString().startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl.toString());
    }
    if (this.currentFormationPdfUrl) {
      URL.revokeObjectURL(this.currentFormationPdfUrl);
    }
  }

  // ================= LOGIQUE DE PERMISSIONS CORRIGÉE =================
  private checkPermissions(employeeId: string) {
    const currentUser = this.authService.getUser();
    this.isViewingOwnProfile = currentUser?.id === employeeId;

    // ✅ CORRECTION : HR et HR Manager peuvent voir TOUS les profils + leur propre profil
    this.canViewAllInfo = this.authService.isHR() || this.authService.isHRManager();

    // ✅ CORRECTION : Les RH peuvent éditer tous les profils SAUF leur propre profil via cette interface
    this.canEdit = this.canViewAllInfo && !this.isViewingOwnProfile;

    console.log('🔐 Permissions Check:');
    console.log('   - Employee ID:', employeeId);
    console.log('   - Current User ID:', currentUser?.id);
    console.log('   - isViewingOwnProfile:', this.isViewingOwnProfile);
    console.log('   - canViewAllInfo (HR/Manager):', this.canViewAllInfo);
    console.log('   - canEdit:', this.canEdit);
    console.log('   - isMyProfilePage:', this.isMyProfilePage);

    // ✅ CORRECTION : Si un employé essaie d'accéder à un profil qui n'est pas le sien
    if (this.authService.isEmployee() && !this.isViewingOwnProfile && !this.isMyProfilePage) {
      console.log('🚫 Employee trying to access another profile - Redirecting to own profile');
      this.showUnauthorizedMessage = true;
      this.loading = false;
      setTimeout(() => {
        const currentUserId = this.authService.getCurrentUserId();
        if (currentUserId) {
          this.router.navigate(['/employees', currentUserId]);
        } else {
          this.router.navigate(['/my-profile']);
        }
      }, 2000);
      return;
    }
  }

  canSeeUpdateForm(): boolean {
    // ✅ CORRECTION : Les RH voient le formulaire pour les autres employés
    return this.canViewAllInfo && !this.isViewingOwnProfile;
  }

  canUploadPhoto(): boolean {
    // ✅ CORRECTION : Seuls les RH peuvent uploader des photos pour les autres employés
    return this.canViewAllInfo && !this.isViewingOwnProfile;
  }

  canSeeReadonlyInfo(): boolean {
    // ✅ CORRECTION : Lecture seule pour son propre profil ou si pas RH
    return this.isViewingOwnProfile || !this.canViewAllInfo;
  }

  canAddFormation(): boolean {
    return this.canViewAllInfo || this.isViewingOwnProfile || this.isMyProfilePage;
  }

  // ✅ NOUVELLE MÉTHODE : Permissions pour les fiches de paie
  canViewPayslipHistory(): boolean {
    // ✅ Employé : peut voir SON historique de fiches de paie
    // ✅ RH/Manager : peut voir TOUS les historiques de fiches de paie + le sien
    return this.canViewAllInfo || this.isViewingOwnProfile;
  }

  // ================= MÉTHODES DE VALIDATION =================
  validatePhone() {
    if (!this.employee?.phone) {
      this.phoneError = '';
      return;
    }
    this.phoneError = this.isTunisianPhoneValid(this.employee.phone) ? '' : 'Le numéro doit avoir 8 chiffres commençant par 2, 5 ou 9';
  }

  validateAddress() {
    if (!this.employee?.address) {
      this.addressError = '';
      return;
    }
    this.addressError = this.isAddressLengthValid(this.employee.address) ? '' : 'L\'adresse ne peut pas dépasser 20 caractères';
  }

  validateSalary() {
    if (this.employee?.salary === undefined || this.employee?.salary === null) {
      this.salaryError = '';
      return;
    }
    this.salaryError = this.isSalaryValid(this.employee.salary) ? '' : 'Le salaire ne peut pas être négatif';
  }

  validatePosition() {
    if (!this.employee?.position) {
      this.positionError = '';
      return;
    }
    this.positionError = this.isPositionLengthValid(this.employee.position) ? '' : 'La position ne peut pas dépasser 20 caractères';
  }

  validateHireDate() {
    if (!this.employee?.hireDate) {
      this.hireDateError = '';
      return;
    }
    this.hireDateError = this.isHireDateValid(this.employee.hireDate) ? '' : 'La date d\'embauche ne peut pas être dans le futur';
  }

  validateStartDate(): void {
    if (!this.newFormation.startDate) {
      this.startDateError = '';
      return;
    }

    const startDate = new Date(this.newFormation.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate > today) {
      this.startDateError = 'Start date cannot be in the future';
    } else {
      this.startDateError = '';
    }

    if (this.newFormation.endDate) {
      this.validateEndDate();
    }
  }

  validateEndDate(): void {
    if (!this.newFormation.endDate) {
      this.endDateError = '';
      return;
    }

    if (!this.newFormation.startDate) {
      this.endDateError = 'Please select start date first';
      return;
    }

    const startDate = new Date(this.newFormation.startDate);
    const endDate = new Date(this.newFormation.endDate);

    if (endDate < startDate) {
      this.endDateError = 'End date must be after start date';
    } else {
      this.endDateError = '';
    }
  }

  // VALIDATEURS
  isTunisianPhoneValid(phone: string): boolean {
    if (!phone) return true;
    const tunisianPhoneRegex = /^(2|5|9)[0-9]{7}$/;
    return tunisianPhoneRegex.test(phone);
  }

  isSalaryValid(value: number): boolean {
    if (value === undefined || value === null) return true;
    return value >= 0;
  }

  isHireDateValid(hireDate: string): boolean {
    if (!hireDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(hireDate);
    return selectedDate <= today;
  }

  isAddressLengthValid(address: string): boolean {
    if (!address) return true;
    return address.length <= 20;
  }

  isPositionLengthValid(position: string): boolean {
    if (!position) return true;
    return position.length <= 20;
  }

  isAdressLengthValid(address: string): boolean {
    if (!address) return true;
    return address.length <= 20;
  }

  // ================= GESTION EMPLOYÉ =================
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
        this.loadEmployeePhoto();
      },
      error: (error) => {
        console.error('❌ Error loading employee:', error);
        this.errorMessage = "Impossible de récupérer les données de l'employé";
        this.loading = false;
        this.showErrorModal = true;

        if (error.position === 401) {
          this.errorMessage = "Accès non autorisé. Token peut être expiré.";
        } else if (error.position === 403) {
          this.errorMessage = "Accès refusé. Vous n'avez pas les permissions nécessaires.";
          this.showUnauthorizedMessage = true;

          if (this.authService.isEmployee()) {
            setTimeout(() => {
              this.router.navigate(['/my-profile']);
            }, 3000);
          }
        } else if (error.position === 404) {
          this.errorMessage = "Employé non trouvé.";
        }
      }
    });
  }

  // ================= GESTION PHOTO =================
  loadEmployeePhoto(): void {
    if (!this.employee?.id) {
      this.previewUrl = '/assets/default-profile.png';
      return;
    }

    this.photoLoading = true;

    this.employeeService.getEmployeePhotoBlob(this.employee.id).subscribe({
      next: (blob: Blob) => {
        if (blob && blob.size > 0) {
          const objectUrl = URL.createObjectURL(blob);
          this.previewUrl = objectUrl;
          this.photoLoading = false;
        } else {
          this.previewUrl = '/assets/default-profile.png';
          this.photoLoading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error loading employee photo from blob:', error);
        this.previewUrl = '/assets/default-profile.png';
        this.photoLoading = false;
      }
    });
  }

  getPhotoUrl(): string {
    if (this.previewUrl) {
      return this.previewUrl as string;
    }
    return '/assets/default-profile.png';
  }

  onPhotoSelected(event: any) {
    if (!this.canUploadPhoto()) {
      this.errorMessage = "Vous n'avez pas la permission de télécharger des photos";
      this.showErrorModal = true;
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = "Veuillez sélectionner un fichier image valide";
      this.showErrorModal = true;
      return;
    }

    this.selectedPhoto = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  uploadPhoto() {
    if (!this.employee?.id || !this.selectedPhoto || !this.canUploadPhoto()) {
      console.error('❌ Cannot upload photo: Missing employee ID, photo, or permissions');
      return;
    }

    console.log('🔄 Starting photo upload for employee:', this.employee.id);

    this.isUploadingPhoto = true;
    const formData = new FormData();
    formData.append('file', this.selectedPhoto);

    this.employeeService.uploadPhoto(this.employee.id, formData).subscribe({
      next: (data: Employee) => {
        this.employee = data;
        this.selectedPhoto = null;
        this.successMessage = "Photo mise à jour avec succès !";
        this.showUploadSuccess = true;
        this.isUploadingPhoto = false;
        console.log('✅ Photo uploaded successfully');

        this.reloadEmployeePhoto();
      },
      error: (error) => {
        console.error('❌ Error uploading photo:', error);
        this.errorMessage = "Erreur lors du téléchargement de la photo.";
        this.showErrorModal = true;
        this.isUploadingPhoto = false;
      }
    });
  }

  private reloadEmployeePhoto(): void {
    console.log('🔄 Reloading employee photo after upload');

    if (this.previewUrl && this.previewUrl.toString().startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl.toString());
    }

    this.previewUrl = null;

    setTimeout(() => {
      this.loadEmployeePhoto();
    }, 500);
  }

  // ================= MISE À JOUR EMPLOYÉ =================
  validateForm(): boolean {
    if (this.employee?.phone && !this.isTunisianPhoneValid(this.employee.phone)) {
      this.errorMessage = "Le numéro de téléphone doit être un numéro tunisien valide (8 chiffres commençant par 2, 5 ou 9)";
      return false;
    }

    if (this.employee?.salary !== undefined && !this.isSalaryValid(this.employee.salary)) {
      this.errorMessage = "Le salaire ne peut pas être négatif";
      return false;
    }

    if (this.employee?.hireDate && !this.isHireDateValid(this.employee.hireDate)) {
      this.errorMessage = "La date d'embauche ne peut pas être dans le futur";
      return false;
    }

    if (this.employee?.position && !this.isPositionLengthValid(this.employee.position)) {
      this.errorMessage = "Le statut ne peut pas dépasser 20 caractères";
      return false;
    }

    if (this.employee?.address && !this.isAddressLengthValid(this.employee.address)) {
      this.errorMessage = "L'adresse ne peut pas dépasser 20 caractères";
      return false;
    }

    return true;
  }

  onUpdateSubmit(event: Event) {
    event.preventDefault();

    if (!this.canEdit) {
      this.errorMessage = "Vous n'avez pas la permission de modifier ce profil";
      this.showErrorModal = true;
      return;
    }

    if (!this.validateForm()) {
      this.showErrorModal = true;
      return;
    }

    this.showUpdateConfirmation = true;
  }

  confirmUpdate() {
    this.showUpdateConfirmation = false;

    if (!this.employee?.id || !this.canEdit) {
      console.error('❌ Cannot update: Missing employee ID or permissions');
      return;
    }

    if (!this.validateForm()) {
      this.showErrorModal = true;
      return;
    }

    console.log('🔄 Starting employee update for:', this.employee.id);

    this.isUpdatingEmployee = true;

    if (this.selectedPhoto) {
      console.log('📸 Photo detected - Uploading photo AND updating info');
      this.uploadPhotoAndUpdateInfo();
    } else {
      console.log('📝 No photo - Updating info only');
      this.updateEmployeeInfoOnly();
    }
  }

  private uploadPhotoAndUpdateInfo(): void {
    if (!this.employee?.id || !this.selectedPhoto) return;

    console.log('🔄 Starting combined photo upload and info update');

    const formData = new FormData();
    formData.append('file', this.selectedPhoto);

    this.employeeService.uploadPhoto(this.employee.id, formData).subscribe({
      next: (photoData: Employee) => {
        console.log('✅ Photo uploaded successfully, now updating info');

        this.updateEmployeeInfo().subscribe({
          next: (infoData: Employee) => {
            this.employee = infoData;
            this.selectedPhoto = null;
            this.successMessage = 'Photo et informations mises à jour avec succès ! 🎉';
            this.showUpdateSuccess = true;
            this.isUpdatingEmployee = false;
            console.log('✅✅ Photo AND info updated successfully');

            this.reloadEmployeeDataAndPhoto();
          },
          error: (error) => {
            console.error('❌ Error updating info after photo upload:', error);
            this.errorMessage = 'Photo uploadée mais erreur lors de la mise à jour des informations.';
            this.showErrorModal = true;
            this.isUpdatingEmployee = false;
          }
        });
      },
      error: (error) => {
        console.error('❌ Error uploading photo:', error);
        this.errorMessage = "Erreur lors du téléchargement de la photo.";
        this.showErrorModal = true;
        this.isUpdatingEmployee = false;
      }
    });
  }

  private updateEmployeeInfoOnly(): void {
    this.updateEmployeeInfo().subscribe({
      next: (data: Employee) => {
        this.employee = data;
        this.successMessage = 'Informations mises à jour avec succès !';
        this.showUpdateSuccess = true;
        this.isUpdatingEmployee = false;
        console.log('✅ Info updated successfully');

        this.reloadEmployeeData();
      },
      error: (error) => {
        console.error('❌ Update error:', error);
        this.errorMessage = 'Erreur lors de la mise à jour.';
        this.showErrorModal = true;
        this.isUpdatingEmployee = false;
      }
    });
  }

  private updateEmployeeInfo() {
    const updatedData: Employee = {
      username: this.employee!.username,
      email: this.employee!.email,
      phone: this.employee!.phone,
      salary: this.employee!.salary,
      position: this.employee!.position,
      hireDate: this.employee!.hireDate,

      // New fields
      cin: this.employee!.cin,
      cnssNumber: this.employee!.cnssNumber,

      address: this.employee!.address,
      city: this.employee!.city,
      matricule: this.employee!.matricule,
      rib: this.employee!.rib,
      bankName: this.employee!.bankName,
      workingDays: this.employee!.workingDays,
      actualWorkingDays: this.employee!.actualWorkingDays,
      transportAllowance: this.employee!.transportAllowance,
      familyAllowance: this.employee!.familyAllowance,
      otherBonuses: this.employee!.otherBonuses
    };

    return this.employeeService.updateEmployeeById(this.employee!.id!, updatedData);
  }

  private reloadEmployeeDataAndPhoto(): void {
    if (!this.employee?.id) return;

    console.log('🔄 Reloading employee data and photo');

    this.employeeService.getEmployeeById(this.employee.id).subscribe({
      next: (data: Employee) => {
        this.employee = data;
        console.log('✅ Employee data reloaded');

        this.reloadEmployeePhoto();
      },
      error: (error) => {
        console.error('❌ Error reloading employee data:', error);
      }
    });
  }

  private reloadEmployeeData(): void {
    if (!this.employee?.id) return;

    console.log('🔄 Reloading employee data');

    this.employeeService.getEmployeeById(this.employee.id).subscribe({
      next: (data: Employee) => {
        this.employee = data;
        console.log('✅ Employee data reloaded after update');
      },
      error: (error) => {
        console.error('❌ Error reloading employee data:', error);
      }
    });
  }

  cancelUpdate() {
    this.showUpdateConfirmation = false;
  }

  // ================= GESTION FORMATIONS =================
  isValidFormationDates(): boolean {
    this.validateStartDate();
    this.validateEndDate();

    if (!this.newFormation.startDate || !this.newFormation.endDate) {
      this.formationErrorMessage = 'Both start and end dates are required';
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
      this.formationErrorMessage = 'Start date must be before end date';
      return false;
    }

    this.formationErrorMessage = '';
    return true;
  }

  addFormation(event?: Event) {
    if (event) event.preventDefault();

    if (!this.employee?.id) return;

    if (!this.canAddFormation()) {
      this.formationErrorMessage = "Vous n'avez pas la permission d'ajouter des formations";
      return;
    }

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
        this.formationSuccessMessage = 'Formation ajoutée avec succès !';
        this.showFormationSuccess = true;
      },
      error: () => {
        this.formationErrorMessage = 'Erreur lors de l\'ajout de la formation.';
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
      this.formationErrorMessage = 'Veuillez sélectionner un fichier PDF.';
    }
  }

  getMaxStartDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getMaxHireDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  resetFormationModal() {
    this.newFormation = { name: '', location: '', startDate: '', endDate: '' };
    this.selectedCertificate = null;
    this.formationSuccessMessage = '';
    this.formationErrorMessage = '';
    this.startDateError = '';
    this.endDateError = '';
  }

  closeFormationModal() {
    this.showFormationModal = false;
    this.resetFormationModal();
  }

  // ================= SUPPRESSION FORMATION =================
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
        this.successMessage = 'Formation supprimée avec succès !';
        this.showDeleteSuccess = true;
        this.closeDeleteConfirmation();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression de la formation.';
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

  // ================= AFFICHAGE PDF FORMATION =================
  viewFormationCertificate(formation: Formation) {
    if (!formation.certificateId) {
      alert('Aucun certificat disponible pour cette formation');
      return;
    }

    this.formationPdfLoading = true;
    this.currentFormationTitle = `Certificat - ${formation.name}`;

    this.employeeService.getFormationCertificateBlob(formation.certificateId).subscribe({
      next: (pdfBlob: Blob) => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        this.currentFormationPdfUrl = pdfUrl;
        this.showFormationPdfModal = true;
        this.formationPdfLoading = false;
      },
      error: (err) => {
        console.error('Error loading formation PDF:', err);
        this.errorMessage = 'Impossible de charger le certificat';
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

  // ================= HISTORIQUE FICHES DE PAIE - CORRIGÉ =================
  viewPayslipHistory() {
    if (this.employee?.id) {
      // ✅ CORRECTION : Vérifier les permissions avec la nouvelle méthode
      if (this.canViewPayslipHistory()) {
        console.log('✅ Accès autorisé à l\'historique des fiches de paie');
        this.router.navigate(['/employees', this.employee.id, 'payslips']);
      } else {
        console.log('❌ Accès refusé à l\'historique des fiches de paie');
        this.errorMessage = "Vous n'avez pas la permission de voir les fiches de paie de cet employé";
        this.showErrorModal = true;
      }
    }
  }

  // ================= NAVIGATION =================
  goToEmployeeList() {
    if (this.authService.isHR() || this.authService.isHRManager()) {
      this.router.navigate(['/employees']);
    } else {
      this.errorMessage = "Vous n'avez pas la permission de voir la liste des employés";
      this.showErrorModal = true;
    }
  }

  goToMyProfile() {
    this.router.navigate(['/my-profile']);
  }

  // ================= MÉTHODES MODALES =================
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
