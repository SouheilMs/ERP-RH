import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeServices } from '../../services/employee.services';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  employee: any;
  loading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeServices
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getEmployee(id);
  }

  getEmployee(id: string) {
    this.loading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: (data: any) => {
        this.employee = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = "Impossible de récupérer l'employé";
        this.loading = false;
      }
    });
  }

  updateEmployee() {
    if (!this.employee?.id) return;

    this.loading = true;
    this.employeeService.updateEmployeeById(this.employee.id, this.employee).subscribe({
      next: (data: any) => {
        this.employee = data;
        this.successMessage = 'Mise à jour réussie !';
        this.errorMessage = '';
        this.loading = false;

        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors de la mise à jour.';
        this.successMessage = '';
        this.loading = false;
      }
    });
  }
}
