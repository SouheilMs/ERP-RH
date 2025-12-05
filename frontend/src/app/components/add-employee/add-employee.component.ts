import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AddEmployeeComponent implements OnInit {

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() employeeAdded = new EventEmitter<void>();

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isOpen = true;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  showSuccessAlert = false;

  canAddEmployee = false;
  passwordStrength = '';

  selectedFile: File | null = null;

  // Roles disponibles
  availableRoles = [
    { value: 'ROLE_EMPLOYEE', label: 'Employé' },
    { value: 'ROLE_HR', label: 'RH' },
    { value: 'ROLE_HRMANAGER', label: 'Manager RH' }
  ];

  availableStatuses = [
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'INACTIVE', label: 'Inactif' },
    { value: 'ON_LEAVE', label: 'En congé' }
  ];

  // Formulaire
  employee = {
    username: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    photoUrl: '',
    photoFile: null as File | null,

    hireDate: '',
    salary: null as number | null,
    position: '',
    customPosition: '',
    status: 'ACTIVE',

    cin: '',
    cnssNumber: '',
    matricule: '',
    workingDays: 22,
    actualWorkingDays: 22,

    address: '',
    city: '',
    rib: '',
    bankName: '',

    transportAllowance: 0,
    familyAllowance: 0,
    otherBonuses: 0,
    role: 'ROLE_EMPLOYEE'
  };

  // Patterns
  private passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  private emailPattern =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // ------------------------------------------
  // INIT
  // ------------------------------------------
  ngOnInit(): void {
    this.checkPermissions();
  }

  // ------------------------------------------
  // PERMISSIONS
  // ------------------------------------------
  private checkPermissions(): void {
    this.canAddEmployee = this.authService.isHRorManager();

    if (!this.canAddEmployee) {
      this.errorMessage = '❌ Vous n’avez pas les permissions pour ajouter un employé.';
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // ------------------------------------------
  // MODAL
  // ------------------------------------------
  openModal() {
    this.checkPermissions();
    if (!this.canAddEmployee) return;

    this.isOpen = true;
    this.errorMessage = '';
    this.passwordStrength = '';
  }

  closeModal() {
    this.isOpen = false;
    this.closeModalEvent.emit();
  }

  // ------------------------------------------
  // VALIDATION
  // ------------------------------------------
  validatePassword(password: string): boolean {
    return this.passwordPattern.test(password);
  }

  validateEmail(email: string): boolean {
    return this.emailPattern.test(email);
  }

  validateForm(): boolean {

    if (!this.canAddEmployee) {
      this.errorMessage = '❌ Permission refusée.';
      return false;
    }

    if (!this.authService.isLoggedIn()) {
      this.errorMessage = '❌ Vous devez vous connecter.';
      return false;
    }

    if (!this.employee.username.trim()) {
      this.errorMessage = 'Le nom est obligatoire.';
      return false;
    }

    if (!this.validateEmail(this.employee.email)) {
      this.errorMessage = 'Email invalide.';
      return false;
    }

    if (!this.validatePassword(this.employee.password)) {
      this.errorMessage =
        'Mot de passe faible. Minimum 8 caractères avec majuscule, minuscule, chiffre et symbole.';
      return false;
    }

    return true;
  }

  calculatePasswordStrength(password: string): string {
    if (!password) return 'empty';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    return strength < 3 ? 'weak' : strength < 5 ? 'medium' : 'strong';
  }

  onPasswordChange() {
    this.passwordStrength = this.calculatePasswordStrength(this.employee.password);
  }

  // ------------------------------------------
  // POSITION
  // ------------------------------------------
  getFinalPosition(): string {
    return this.employee.position === 'OTHER'
      ? this.employee.customPosition
      : this.employee.position;
  }

  // ------------------------------------------
  // SAVE EMPLOYEE
  // ------------------------------------------
  async saveEmployee() {
    if (!this.validateForm()) return;

    const data = {
      username: this.employee.username.trim(),
      email: this.employee.email.trim().toLowerCase(),
      password: this.employee.password,
      phone: this.employee.phone || '',
      status: 'Active',
      roleNames: [this.employee.role]
    };

    this.isLoading = true;

    this.http.post(
      'http://localhost:8081/api/employees/Add-employee',
      data,
      { headers: this.getAuthHeaders(), observe: 'response', responseType: 'text' as 'json' }
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.employeeAdded.emit();
        this.showSuccessAlert = true;
        this.closeModal();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.handleError(error);
      }
    });
  }

  // ------------------------------------------
  // ERROR HANDLING
  // ------------------------------------------
  private handleError(error: any): string {
    if (error.status === 409) return 'Un employé avec cet email existe déjà.';
    if (error.status === 400) return 'Données invalides.';
    if (error.status === 500) return 'Erreur serveur.';
    if (error.status === 0) return 'Impossible de contacter le serveur.';
    return 'Erreur inconnue.';
  }
}
