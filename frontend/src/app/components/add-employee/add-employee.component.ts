import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
  isSubmitting = false;
  selectedFile: File | null = null;

  employee = {
    // Personal Information
    username: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    photoUrl: '', // URL ou base64 de la photo
    photoFile: null as File | null, // Fichier photo original

    // Employment Information
    hireDate: '',
    salary: null as number | null,
    position: '',
    customPosition: '',
    status: 'ACTIVE',

    // Tunisian Payroll Information
    cin: '',
    cnssNumber: '',
    matricule: '',
    workingDays: 22,
    actualWorkingDays: 22,

    // Address & Bank Information
    address: '',
    city: '',
    rib: '',
    bankName: '',

    // Allowances & Bonuses
    transportAllowance: 0,
    familyAllowance: 0,
    otherBonuses: 0
  };

  constructor(private http: HttpClient) {}

  openModal() {
    this.isOpen = true;
    this.errorMessage = '';
    this.resetForm();
  }

  closeModal() {
    this.isOpen = false;
    this.closeModalEvent.emit();
  }

  // Gestion de la sélection de fichier
  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      // Validation du type de fichier
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file (JPG, PNG, GIF)';
        return;
      }

      // Validation de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.employee.photoFile = file;

      // Prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.employee.photoUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      this.errorMessage = '';
    }
  }

  // Supprimer la photo sélectionnée
  removePhoto(): void {
    this.employee.photoUrl = '';
    this.employee.photoFile = null;
    this.selectedFile = null;

    // Réinitialiser l'input file
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Get final position (handle custom position)
  getFinalPosition(): string {
    if (this.employee.position === 'OTHER' && this.employee.customPosition) {
      return this.employee.customPosition;
    }
    return this.employee.position;
  }
  async saveEmployee() {
    console.log('=== Starting employee creation with photo ===');

    // Validations de base
    if (!this.employee.username || !this.employee.email || !this.employee.password) {
      this.errorMessage = 'All required fields must be completed.';
      return;
    }

    if (!this.employee.cin || !this.employee.cnssNumber || !this.employee.matricule) {
      this.errorMessage = 'The CIN, CNSS and Matricule fields are mandatory.';
      return;
    }

    if (!this.employee.position) {
      this.errorMessage = 'Please select a position.';
      return;
    }

    if (this.employee.position === 'OTHER' && !this.employee.customPosition) {
      this.errorMessage = 'Please specify the custom position.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      // Préparation des données avec photo
      const employeeData: any = {
        username: this.employee.username,
        email: this.employee.email,
        password: this.employee.password,
        phone: this.employee.phone || null,
        gender: this.employee.gender || null,
        hireDate: this.employee.hireDate || null,
        salary: this.employee.salary ? Number(this.employee.salary) : null,
        status: this.employee.status,
        position: this.getFinalPosition(),
        cin: this.employee.cin,
        cnssNumber: this.employee.cnssNumber,
        matricule: this.employee.matricule,
        workingDays: Number(this.employee.workingDays),
        actualWorkingDays: Number(this.employee.actualWorkingDays),
        address: this.employee.address || null,
        city: this.employee.city || null,
        rib: this.employee.rib || null,
        bankName: this.employee.bankName || null,
        transportAllowance: Number(this.employee.transportAllowance),
        familyAllowance: Number(this.employee.familyAllowance),
        otherBonuses: Number(this.employee.otherBonuses)
      };

      // AJOUT DE LA PHOTO - Envoyer l'URL Base64 au backend
      if (this.employee.photoUrl) {
        console.log('Adding photo to employee data...');
        employeeData.photoUrl = this.employee.photoUrl;
        employeeData.photoId = `photo_${Date.now()}`;

        console.log('Photo data length:', this.employee.photoUrl.length);
        console.log('Photo preview:', this.employee.photoUrl.substring(0, 100) + '...');
      } else {
        console.log('No photo to add');
      }

      console.log('Sending employee data to backend...');

      // ✅ CORRECTION : Utilisez le NOUVEAU endpoint
      await this.sendEmployeeData(employeeData);

    } catch (error) {
      this.isSubmitting = false;
      console.error('Error in saveEmployee:', error);
      this.errorMessage = 'Error creating employee. Please try again.';
    }
  }

  private async sendEmployeeData(employeeData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // ✅ CORRECTION : Utilisez '/add-with-photo' au lieu de '/Add-employee'
      this.http.post('http://localhost:8081/api/employees/add-with-photo', employeeData)
        .subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            console.log('Employee created successfully! Response:', response);

            this.employeeAdded.emit();
            this.closeModal();
            resolve();
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Error creating employee:', error);
            console.error('Full error details:', error);

            let errorMsg = 'Error adding employee. Please check the data and try again.';

            if (error.error && error.error.message) {
              errorMsg = error.error.message;
            } else if (error.status === 400) {
              errorMsg = 'Invalid data. Please check all required fields.';
            } else if (error.status === 409) {
              errorMsg = 'An employee with this email already exists.';
            } else if (error.status === 500) {
              errorMsg = 'Server error. Please try again later.';
            } else if (error.status === 0) {
              errorMsg = 'Cannot connect to server. Please check if the backend is running.';
            }

            this.errorMessage = errorMsg;
            reject(error);
          }
        });
    });
  }

// Méthode utilisant fetch API pour mieux debugger
  private async sendWithFetch(employeeData: any) {
    try {
      const response = await fetch('http://localhost:8081/api/employees/Add-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData)
      });

      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', response.headers);

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
        console.log('Parsed JSON response:', responseData);
      } catch (parseError) {
        console.log('Response is not JSON:', responseText);
        responseData = { message: responseText };
      }

      if (response.ok) {
        // Succès - même si la réponse n'est pas du JSON valide
        console.log('Employee created successfully!');
        this.isSubmitting = false;
        this.employeeAdded.emit();
        this.closeModal();
      } else {
        // Erreur HTTP
        this.isSubmitting = false;
        const errorMessage = responseData.message || responseData.error || `HTTP Error ${response.status}`;
        this.errorMessage = errorMessage;
        console.error('Server error:', errorMessage);
      }

    } catch (networkError) {
      // Erreur réseau
      this.isSubmitting = false;
      console.error('Network error:', networkError);
      this.errorMessage = 'Network error. Please check your connection.';
    }
  }

  // Reset form to initial state
  private resetForm() {
    this.employee = {
      username: '',
      email: '',
      password: '',
      phone: '',
      gender: '',
      photoUrl: '',
      photoFile: null,
      hireDate: '',
      salary: null,
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
      otherBonuses: 0
    };
    this.selectedFile = null;
  }

  // Position options for the template (if needed)
  positionOptions = [
    { value: 'SOFTWARE_DEVELOPER', label: 'Software Developer' },
    { value: 'SENIOR_DEVELOPER', label: 'Senior Developer' },
    { value: 'FRONTEND_DEVELOPER', label: 'Frontend Developer' },
    { value: 'BACKEND_DEVELOPER', label: 'Backend Developer' },
    { value: 'FULLSTACK_DEVELOPER', label: 'Fullstack Developer' },
    { value: 'SOFTWARE_ENGINEER', label: 'Software Engineer' },
    { value: 'SYSTEM_ENGINEER', label: 'System Engineer' },
    { value: 'DEVOPS_ENGINEER', label: 'DevOps Engineer' },
    { value: 'QA_ENGINEER', label: 'QA Engineer' },
    { value: 'DATA_ENGINEER', label: 'Data Engineer' },
    { value: 'PROJECT_MANAGER', label: 'Project Manager' },
    { value: 'TEAM_LEAD', label: 'Team Lead' },
    { value: 'TECH_LEAD', label: 'Tech Lead' },
    { value: 'PRODUCT_MANAGER', label: 'Product Manager' },
    { value: 'HR_MANAGER', label: 'HR Manager' },
    { value: 'FINANCE_MANAGER', label: 'Finance Manager' },
    { value: 'SALES_MANAGER', label: 'Sales Manager' },
    { value: 'MARKETING_SPECIALIST', label: 'Marketing Specialist' },
    { value: 'UI_UX_DESIGNER', label: 'UI/UX Designer' },
    { value: 'GRAPHIC_DESIGNER', label: 'Graphic Designer' },
    { value: 'DATA_ANALYST', label: 'Data Analyst' },
    { value: 'BUSINESS_ANALYST', label: 'Business Analyst' },
    { value: 'IT_SUPPORT', label: 'IT Support' },
    { value: 'NETWORK_ADMIN', label: 'Network Administrator' },
    { value: 'DATABASE_ADMIN', label: 'Database Administrator' },
    { value: 'SECURITY_ANALYST', label: 'Security Analyst' },
    { value: 'INTERN', label: 'Intern' },
    { value: 'JUNIOR_DEVELOPER', label: 'Junior Developer' },
    { value: 'MID_LEVEL_DEVELOPER', label: 'Mid-Level Developer' },
    { value: 'SENIOR_ENGINEER', label: 'Senior Engineer' },
    { value: 'ARCHITECT', label: 'Software Architect' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Status options
  statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ON_LEAVE', label: 'On Leave' },
    { value: 'PROBATION', label: 'Probation' },
    { value: 'TERMINATED', label: 'Terminated' },
    { value: 'RESIGNED', label: 'Resigned' }
  ];

  // Gender options
  genderOptions = [
    { value: '', label: '-- Select Gender --' },
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
  ];
  testWithPhotoNow() {
    const testData = {
      username: "Test With Photo",
      email: "testphoto" + Date.now() + "@example.com",
      password: "password123",
      cin: "12345678",
      cnssNumber: "123456789012",
      matricule: "EMPPHOTO" + Date.now(),
      position: "SOFTWARE_DEVELOPER",
      status: "ACTIVE",
      workingDays: 22,
      actualWorkingDays: 22,
      transportAllowance: 0,
      familyAllowance: 0,
      otherBonuses: 0,
      photoUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      photoId: "test_photo_id_" + Date.now()
    };

    console.log('Testing with NEW endpoint /add-with-photo...');

    // ✅ CHANGEZ L'URL POUR UTILISER LE NOUVEAU ENDPOINT
    this.http.post('http://localhost:8081/api/employees/add-with-photo', testData)
      .subscribe({
        next: (response: any) => {
          console.log('✅ SUCCESS with photo:', response);
          alert('Employee created with photo! ID: ' + response.employeeId);
        },
        error: (error) => {
          console.log('❌ ERROR with photo:', error);
          if (error.error && error.error.message) {
            alert('Error: ' + error.error.message);
          } else {
            alert('Error: ' + error.message);
          }
        }
      });
  }

}
