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

  isOpen = true;
  errorMessage = '';

  employee = {
    username: '',
    email: '',
    password: '',
    phone: '',
    status: 'Active',
  };

  constructor(private http: HttpClient) {
  }

  openModal() {
    this.isOpen = true;
    this.errorMessage = '';
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

    this.http.post('http://localhost:8081/api/employees/Add-employee', this.employee, {observe: 'response'})
      .subscribe({
        next: (res) => {
          // 🔥 Ajout pour vider l'erreur après succès
          this.errorMessage = '';

          if (res.status >= 200 && res.status < 300) {
            this.closeModal();
          }
        },
        error: () => {
          this.closeModal();
        }
      });
  }
}
