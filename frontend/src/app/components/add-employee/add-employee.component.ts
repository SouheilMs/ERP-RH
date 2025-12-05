import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class AddEmployeeComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() employeeAdded = new EventEmitter<void>();

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isOpen = true;
  errorMessage = '';
  isLoading = false;
  passwordStrength = '';
  showSuccessAlert = false;
  successMessage = '';

  //  VARIABLE POUR VÉRIFIER LES PERMISSIONS
  canAddEmployee = false;

  // Liste des rôles disponibles - CORRIGÉ SELON VOTRE ENUM
  availableRoles = [
    { value: 'ROLE_EMPLOYEE', label: 'Employé' },
    { value: 'ROLE_HR', label: 'RH' },
    { value: 'ROLE_HRMANAGER', label: 'Manager RH' }
  ];

  // Liste des statuts disponibles
  availableStatuses = [
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'INACTIVE', label: 'Inactif' },
    { value: 'ON_LEAVE', label: 'En congé' }
  ];

  employee = {
    username: '',
    email: '',
    password: '',
    phone: '',
    status: 'ACTIVE',
    role: 'ROLE_EMPLOYEE'
  };

  // Pattern de validation du mot de passe
  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Pattern de validation d'email
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  ngOnInit(): void {
    //  VÉRIFIER LES PERMISSIONS AU CHARGEMENT
    this.checkPermissions();
  }

  //  NOUVELLE MÉTHODE : Vérifier les permissions
  private checkPermissions(): void {
    this.canAddEmployee = this.authService.isHRorManager();

    console.log(' AddEmployeeComponent - Permissions vérifiées:');
    console.log('   - canAddEmployee:', this.canAddEmployee);
    console.log('   - isHR:', this.authService.isHR());
    console.log('   - isHRManager:', this.authService.isHRManager());
    console.log('   - Rôles utilisateur:', this.authService.getUserRoles());

    if (!this.canAddEmployee) {
      this.errorMessage = ' Vous n\'avez pas les permissions pour ajouter un employé.';
      console.warn(' Accès refusé - L\'utilisateur n\'est pas RH ou Manager RH');
    }
  }

  // MÉTHODE : Obtenir les headers d'authentification
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log(' Obtention des headers auth - Token:', token ? 'PRÉSENT' : 'NULL');

    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    } else {
      console.error(' Aucun token d\'authentification trouvé !');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
  }

  openModal() {
    //  RE-VÉRIFIER LES PERMISSIONS À L'OUVERTURE
    this.checkPermissions();

    if (!this.canAddEmployee) {
      return; // Ne pas ouvrir la modal si pas de permissions
    }

    this.isOpen = true;
    this.errorMessage = '';
    this.isLoading = false;
    this.showSuccessAlert = false;
    this.employee.role = 'ROLE_EMPLOYEE';
    this.employee.status = 'ACTIVE';
    this.passwordStrength = '';
  }

  closeModal() {
    this.isOpen = false;
    this.closeModalEvent.emit();
  }

  // Validation du mot de passe
  validatePassword(password: string): boolean {
    return this.passwordPattern.test(password);
  }

  // Validation de l'email
  validateEmail(email: string): boolean {
    return this.emailPattern.test(email);
  }

  // Calcul de la force du mot de passe
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

  // Validation du formulaire
  validateForm(): boolean {
    // VÉRIFIER D'ABORD LES PERMISSIONS
    if (!this.canAddEmployee) {
      this.errorMessage = ' Vous n\'avez pas les permissions pour ajouter un employé.';
      return false;
    }

    //  VÉRIFIER SI L'UTILISATEUR EST AUTHENTIFIÉ
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'Vous n\'êtes pas connecté. Veuillez vous connecter d\'abord.';
      return false;
    }

    if (!this.employee.username.trim()) {
      this.errorMessage = 'Le nom complet est obligatoire.';
      return false;
    }

    if (!this.employee.email.trim()) {
      this.errorMessage = 'L\'email est obligatoire.';
      return false;
    }

    if (!this.validateEmail(this.employee.email)) {
      this.errorMessage = 'Veuillez entrer un email valide.';
      return false;
    }

    if (!this.employee.password) {
      this.errorMessage = 'Le mot de passe est obligatoire.';
      return false;
    }

    if (!this.validatePassword(this.employee.password)) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&).';
      return false;
    }

    return true;
  }

  saveEmployee() {
    //  VÉRIFIER LES PERMISSIONS AVANT TOUT
    if (!this.canAddEmployee) {
      this.errorMessage = ' Vous n\'avez pas les permissions pour ajouter un employé.';
      return;
    }

    //  VÉRIFIER L'AUTHENTIFICATION
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = ' Vous n\'êtes pas connecté. Veuillez vous connecter d\'abord.';
      return;
    }

    // Validation du formulaire
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Préparer les données pour l'API - CORRECTION : status doit être 'Active' pour correspondre au backend
    const employeeData = {
      username: this.employee.username.trim(),
      email: this.employee.email.trim().toLowerCase(),
      password: this.employee.password,
      phone: this.employee.phone || '',
      status: 'Active',
      roleNames: [this.employee.role]
    };

    console.log('📤 Données envoyées:', employeeData);


    const headers = this.getAuthHeaders();
    console.log('🔐 Headers envoyés:', headers.keys());

    // Appel API avec headers d'authentification
    this.http.post('http://localhost:8081/api/employees/Add-employee', employeeData, {
      headers: headers,
      observe: 'response',
      responseType: 'text' as 'json'
    })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log(' Réponse serveur:', response);

          if (response.status >= 200 && response.status < 300) {
            this.showSuccessMessage();
            this.closeModal();
            this.employeeAdded.emit();
            this.resetForm();
          } else {
            this.errorMessage = 'Réponse inattendue du serveur.';
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error(' Erreur détaillée:', error);
          console.error(' Statut erreur:', error.status);
          console.error(' Message erreur:', error.message);

          // Gestion d'erreur améliorée
          if (error.status === 401) {
            this.errorMessage = 'Authentification échouée. Veuillez vous reconnecter.';
            console.error(' Le token est peut-être expiré ou invalide');
          } else if (error.status === 400) {
            this.errorMessage = 'Données invalides. Vérifiez les informations.';
          } else if (error.status === 403) {
            this.errorMessage = 'Vous n\'avez pas les permissions pour ajouter un employé.';
          } else if (error.status === 409) {
            this.errorMessage = 'Un employé avec cet email existe déjà.';
          } else if (error.status === 500) {
            this.errorMessage = 'Erreur interne du serveur. Veuillez réessayer.';
          } else {
            this.errorMessage = `Erreur: ${error.message}`;
          }
        }
      });
  }

  private showSuccessMessage() {
    this.successMessage = ' Employé créé avec succès';
    this.showSuccessAlert = true;

    // Masquer l'alerte après 5 secondes
    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 5000);
  }

  private resetForm() {
    this.employee = {
      username: '',
      email: '',
      password: '',
      phone: '',
      status: 'ACTIVE',
      role: 'ROLE_EMPLOYEE'
    };
    this.passwordStrength = '';
  }

  //  MÉTHODE DE TEST TEMPORAIRE
  testAuth(): void {
    console.log(' TEST AUTHENTIFICATION:');
    console.log('  - Connecté:', this.authService.isLoggedIn());
    console.log('  - Token:', this.authService.getToken());
    console.log('  - Rôles:', this.authService.getUserRoles());
    console.log('  - Peut ajouter employés:', this.authService.isHRorManager());
  }
}
