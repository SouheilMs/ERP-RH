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

  employee = {
    // Personal Information
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',

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

  // Check if passwords match
  passwordsMatch(): boolean {
    return this.employee.password === this.employee.confirmPassword;
  }

  // Get final position (handle custom position)
  getFinalPosition(): string {
    if (this.employee.position === 'OTHER' && this.employee.customPosition) {
      return this.employee.customPosition;
    }
    return this.employee.position;
  }

  saveEmployee() {
    // Basic validation
    if (!this.employee.username || !this.employee.email || !this.employee.password) {
      this.errorMessage = 'All required fields must be completed..';
      return;
    }


    // Required Tunisian fields validation
    if (!this.employee.cin || !this.employee.cnssNumber || !this.employee.matricule) {
      this.errorMessage = 'The CIN, CNSS and Matricule fields are mandatory.';
      return;
    }

    // Position validation
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

    // Prepare the data for API
    const employeeData = {
      username: this.employee.username,
      email: this.employee.email,
      password: this.employee.password,
      phone: this.employee.phone || null,
      gender: this.employee.gender || null,
      hireDate: this.employee.hireDate || null,
      salary: this.employee.salary ? Number(this.employee.salary) : null,
      status: this.employee.status,
      position: this.getFinalPosition(),

      // Tunisian payroll fields
      cin: this.employee.cin,
      cnssNumber: this.employee.cnssNumber,
      matricule: this.employee.matricule,
      workingDays: Number(this.employee.workingDays),
      actualWorkingDays: Number(this.employee.actualWorkingDays),

      // Address & bank
      address: this.employee.address || null,
      city: this.employee.city || null,
      rib: this.employee.rib || null,
      bankName: this.employee.bankName || null,

      // Allowances
      transportAllowance: Number(this.employee.transportAllowance),
      familyAllowance: Number(this.employee.familyAllowance),
      otherBonuses: Number(this.employee.otherBonuses)
    };

    this.http.post('http://localhost:8081/api/employees/Add-employee', employeeData, { observe: 'response' })
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;

          if (res.status >= 200 && res.status < 300) {
            this.employeeAdded.emit(); // Notify parent that employee was added
            this.closeModal();
          } else {
            this.errorMessage = 'Error adding employee.';
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error adding employee:', error);

          if (error.status === 400) {
            this.errorMessage = 'Invalid data. Please check the information you entered..';
          } else if (error.status === 409) {
            this.errorMessage = 'An employee with this email address already exists.';
          } else {
            this.closeModal()
          }
        }
      });
  }

  // Reset form to initial state
  private resetForm() {
    this.employee = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      gender: '',
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
}
