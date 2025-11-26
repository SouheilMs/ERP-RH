import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

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
export class AddEmployeeComponent {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() employeeAdded = new EventEmitter<void>();

  isOpen = true;
  errorMessage = '';
  isLoading = false;

  // Liste des rôles disponibles
  availableRoles = [
    { value: 'ROLE_EMPLOYEE', label: 'Employé' },
    { value: 'ROLE_HR', label: 'RH' },
    { value: 'ROLE_HRMANAGER', label: 'Manager RH' }
  ];

  employee = {
    username: '',
    email: '',
    password: '',
    phone: '',
    status: 'Active', // Valeur par défaut
    role: 'ROLE_EMPLOYEE'
  };

  constructor(private http: HttpClient) {}

  openModal() {
    this.isOpen = true;
    this.errorMessage = '';
    this.isLoading = false;
    this.employee.role = 'ROLE_EMPLOYEE';
    this.employee.status = 'Active'; // Réinitialiser le statut
  }

  closeModal() {
    this.isOpen = false;
    this.closeModalEvent.emit();
  }

  saveEmployee() {
    if (!this.employee.username || !this.employee.email || !this.employee.password) {
      this.errorMessage = 'Tous les champs obligatoires doivent être remplis.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Préparer les données - CORRECTION : status doit avoir une valeur
    const employeeData = {
      username: this.employee.username,
      email: this.employee.email,
      password: this.employee.password,
      phone: this.employee.phone || '', // Assurer que phone n'est pas undefined
      status: this.employee.status || 'Active', // Valeur par défaut
      roleNames: [this.employee.role]
    };

    console.log('📤 Données envoyées:', employeeData);

    // Utiliser SEULEMENT l'endpoint qui fonctionne
    this.http.post('http://localhost:8081/api/employees/Add-employee', employeeData, {
      observe: 'response',
      responseType: 'text' as 'json' // Important pour gérer les réponses texte
    })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log('✅ Réponse serveur:', response);

          if (response.status >= 200 && response.status < 300) {
            console.log('🎉 Employé créé avec succès');
            this.closeModal();
            this.employeeAdded.emit();
            this.resetForm();
          } else {
            this.errorMessage = 'Réponse inattendue du serveur.';
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('❌ Erreur détaillée:', error);

          // Gestion d'erreur améliorée
          if (error.status === 400) {
            this.errorMessage = 'Données invalides. Vérifiez les informations.';
          } else if (error.status === 409) {
            this.errorMessage = 'Un employé avec cet email existe déjà.';
          } else if (error.status === 500) {
            this.errorMessage = 'Erreur interne du serveur.';
          } else {
            this.errorMessage = `Erreur: ${error.message}`;
          }
        }
      });
  }

  private resetForm() {
    this.employee = {
      username: '',
      email: '',
      password: '',
      phone: '',
      status: 'Active',
      role: 'ROLE_EMPLOYEE'
    };
  }
}
