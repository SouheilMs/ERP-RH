import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeeServices } from '../../services/employee.services';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {

  employees: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(private employeeService: EmployeeServices) {}

  ngOnInit(): void {
    this.loadEmployees();
  }


  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    this.employeeService.getAllEmployees().subscribe({
      next: (data: any[]) => {
        console.log(" Employés récupérés :", data);
        this.employees = data;
        if (this.employees.length === 0) {
          this.errorMessage = 'Aucun employé trouvé.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(" Erreur récupération :", err);
        this.errorMessage = 'Impossible de récupérer la liste des employés.';
        this.loading = false;
      }

    });

  }

  // Exporter la liste en Excel
  exportExcel(): void {
    this.employeeService.exportEmployeesToExcel().subscribe((blob: any) => {
      saveAs(blob, 'employees.xlsx');
    }, (error: any) => {
      console.error("Erreur export Excel :", error);
    });
  }
  // Importer un fichier Excel
  importExcel(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.employeeService.importEmployeesFromExcel(file).subscribe(
      (res: string) => {
        this.loadEmployees(); // Recharge la liste après import
        alert(res);           // Affiche le message envoyé par le backend
      },
      (error: any) => {
        console.error("Erreur import Excel :", error);
        alert('Erreur lors de l’import du fichier.');
      }
    );
  }
}
