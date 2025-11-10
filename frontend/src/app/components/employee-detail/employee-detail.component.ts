import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeServices, Employee } from '../../services/employee.services';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null; // ✅ seule déclaration
  loading = true;
  errorMessage = '';
  successMessage = '';

  selectedPhoto: File | null = null; // pour upload
  previewUrl: any = null;             // pour preview

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeServices
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getEmployee(id);
  }

  // Récupérer un employé
  getEmployee(id: string) {
    this.loading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: (data: Employee) => {
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

  // Mettre à jour l'employé
  updateEmployee() {
    if (!this.employee?.id) return;

    this.loading = true;
    this.employeeService.updateEmployeeById(this.employee.id, this.employee).subscribe({
      next: (data: Employee) => {
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

  // Sélection d'une photo
  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedPhoto = file;

    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(file);
  }

  uploadPhoto() {
    if (!this.employee?.id || !this.selectedPhoto) return;

    this.loading = true;
    const formData = new FormData();
    formData.append('file', this.selectedPhoto);

    this.employeeService.uploadPhoto(this.employee.id, formData).subscribe({
      next: (data: Employee) => {
        this.employee!.photoUrl = data.photoUrl; // <-- ici
        this.previewUrl = null;
        this.selectedPhoto = null;
        this.successMessage = "Photo mise à jour avec succès !";
        this.loading = false;

        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = "Erreur lors du téléchargement de la photo.";
        this.loading = false;
      }
    });
  }

}
