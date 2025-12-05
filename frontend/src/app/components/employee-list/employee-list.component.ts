import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeeServices, Employee } from '../../services/employee.service';
import { saveAs } from 'file-saver';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {AddEmployeeComponent} from '../add-employee/add-employee.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AddEmployeeComponent],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {

  employees: Employee[] = [];
  searchTerm: string = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  filteredEmployees: any[] = [];
  showAdd = false;


  constructor(
    private employeeService: EmployeeServices,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.loadEmployees();
  }

  // Charger les employés
  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    this.employeeService.getAllEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees = data;
        this.loading = false;
      },
      error: (err) => {
        console.error("Erreur récupération :", err);
        this.errorMessage = 'Impossible de récupérer la liste des employés.';
        this.loading = false;
      }
    });
  }


  // Filtrer les employés
  filterEmployees(): void {
    if (!this.searchTerm) {
      this.filteredEmployees = [...this.employees];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredEmployees = this.employees.filter(emp =>
      emp.username?.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term) ||
      emp.phone?.toLowerCase().includes(term) ||
      emp.status?.toLowerCase().includes(term)
    );
  }


  // Export Excel
  exportExcel(): void {
    this.employeeService.exportEmployees().subscribe({
      next: (blob: any) => saveAs(blob, 'employees.xlsx'),
      error: (err) => console.error("Erreur export Excel :", err)
    });
  }

  // Import Excel
  importExcel(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.employeeService.importEmployees(file).subscribe({
      next: (res) => {
        this.loadEmployees(); // Recharge la liste après import
        this.successMessage = "Import réussi !";
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error("Erreur import Excel :", err);
        this.errorMessage = "Erreur lors de l'import.";
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }


  // Supprimer un employé
  deleteEmployee(id: string | undefined): void {
    if (!id) return;
    if (!confirm("Confirmer la suppression ?")) return;

    this.loading = true;

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        // Remplacer le tableau par une nouvelle instance filtrée
        this.employees = [...this.employees.filter(e => e.id !== id)];

        this.loading = false;
        this.successMessage = "Employé supprimé avec succès !";
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error("Erreur suppression :", err);
        this.loading = false;
        this.errorMessage = "Suppression impossible.";
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }


  trackByEmployeeId(index: number, emp: Employee): string {
    return emp.id!;
  }

}
