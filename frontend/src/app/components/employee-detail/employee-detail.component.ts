import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeServices, Employee, Formation } from '../../services/employee.services';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  loading = true;
  errorMessage = '';
  successMessage = '';

  // Modal formation
  showFormationModal = false;
  newFormation: any = { name: '', location: '', startDate: '', endDate: '' };
  selectedCertificate: File | null = null;
  formationSuccessMessage = '';
  formationErrorMessage = '';

  // Photo
  selectedPhoto: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private route: ActivatedRoute, public employeeService: EmployeeServices) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getEmployee(id);
  }

  getEmployee(id: string) {
    this.loading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: (data: Employee) => {
        this.employee = data;
        this.loading = false;
        this.previewUrl = null;
      },
      error: () => {
        this.errorMessage = "Impossible de récupérer l'employé";
        this.loading = false;
      }
    });
  }

  getPhotoUrl(): string {
    if (this.previewUrl) return this.previewUrl as string;
    if (this.employee?.photoId) return this.employeeService.getEmployeePhoto(this.employee.id!);
    return 'assets/default-profile.png';
  }

  updateEmployee() {
    if (!this.employee?.id) return;

    const updatedData: Employee = {
      username: this.employee.username,
      email: this.employee.email,
      phone: this.employee.phone,
      salary: this.employee.salary,
      status: this.employee.status,
      hireDate: this.employee.hireDate,

      // Nouveaux champs
      cin: this.employee.cin,
      cnssNumber: this.employee.cnssNumber,
      position: this.employee.position,
      address: this.employee.address,
      city: this.employee.city,
      matricule: this.employee.matricule,
      rib: this.employee.rib,
      bankName: this.employee.bankName,
      workingDays: this.employee.workingDays,
      actualWorkingDays: this.employee.actualWorkingDays,
      transportAllowance: this.employee.transportAllowance,
      familyAllowance: this.employee.familyAllowance,
      otherBonuses: this.employee.otherBonuses
    };

    this.employeeService.updateEmployeeById(this.employee.id, updatedData).subscribe({
      next: (data: Employee) => {
        this.employee = data;
        this.successMessage = 'Mise à jour réussie !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la mise à jour.';
      }
    });
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedPhoto = file;
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(file);
  }

  uploadPhoto() {
    if (!this.employee?.id || !this.selectedPhoto) return;

    const formData = new FormData();
    formData.append('file', this.selectedPhoto);

    this.employeeService.uploadPhoto(this.employee.id, formData).subscribe({
      next: (data: Employee) => {
        this.employee = data;
        this.selectedPhoto = null;
        this.successMessage = "Photo mise à jour avec succès !";
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = "Erreur lors du téléchargement de la photo.";
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  onCertificateSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedCertificate = file;
      this.formationErrorMessage = '';
    } else {
      this.selectedCertificate = null;
      this.formationErrorMessage = 'Veuillez sélectionner un fichier PDF.';
      setTimeout(() => (this.formationErrorMessage = ''), 3000);
    }
  }

  addFormation(event?: Event) {
    if (event) event.preventDefault();
    if (!this.employee?.id) return;

    const formData = new FormData();
    formData.append('name', this.newFormation.name);
    formData.append('location', this.newFormation.location);
    formData.append('startDate', this.newFormation.startDate);
    formData.append('endDate', this.newFormation.endDate);
    if (this.selectedCertificate)
      formData.append('certificate', this.selectedCertificate, this.selectedCertificate.name);

    this.employeeService.addFormation(this.employee.id, formData).subscribe({
      next: (formation: Formation) => {
        if (!this.employee!.formations) this.employee!.formations = [];
        this.employee!.formations.push(formation);
        this.closeFormationModal();
        this.formationSuccessMessage = 'Formation ajoutée avec succès !';
        setTimeout(() => (this.formationSuccessMessage = ''), 3000);
      },
      error: () => {
        this.formationErrorMessage = 'Erreur lors de l\'ajout de la formation.';
        setTimeout(() => (this.formationErrorMessage = ''), 3000);
      }
    });
  }

  resetFormationModal() {
    this.newFormation = { name: '', location: '', startDate: '', endDate: '' };
    this.selectedCertificate = null;
    this.formationSuccessMessage = '';
    this.formationErrorMessage = '';
  }

  closeFormationModal() {
    this.showFormationModal = false;
    this.resetFormationModal();
  }

  deleteFormation(formationId: string | undefined) {
    if (!formationId || !this.employee?.id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return;

    this.employeeService.deleteFormation(this.employee.id, formationId).subscribe({
      next: () => {
        this.employee!.formations = this.employee!.formations?.filter((f: Formation) => f.id !== formationId);
        this.successMessage = 'Formation supprimée avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression de la formation.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // ====================== MÉTHODE CALCUL IRPP ======================

  // Méthode pour calculer l'IRPP selon le barème tunisien
  calculateIRPP(salaireImposable: number): number {
    let irpp = 0;

    if (salaireImposable <= 5000) {
      irpp = 0;
    } else if (salaireImposable <= 20000) {
      irpp = (salaireImposable - 5000) * 0.26;
    } else if (salaireImposable <= 30000) {
      irpp = (15000 * 0.26) + (salaireImposable - 20000) * 0.28;
    } else if (salaireImposable <= 50000) {
      irpp = (15000 * 0.26) + (10000 * 0.28) + (salaireImposable - 30000) * 0.32;
    } else {
      irpp = (15000 * 0.26) + (10000 * 0.28) + (20000 * 0.32) + (salaireImposable - 50000) * 0.35;
    }

    return irpp;
  }

  // Méthode pour formater la date
  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      return '-';
    }
  }

  // ====================== FICHE DE PAIE AVEC TABLEAU ======================

  // ====================== FICHE DE PAIE SANS AUTOTABLE ======================

// ====================== FICHE DE PAIE AVEC VOTRE STRUCTURE ======================

  // ====================== FICHE DE PAIE AVEC VOTRE STRUCTURE ======================

  downloadPayslipPDF() {
    if (!this.employee) {
      alert('Les informations de l\'employé ne sont pas encore chargées.');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 20;

      // ================= EN-TÊTE =================
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FICHE DE PAIE - TUNISIE', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Informations entreprise
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('ENTREPRISE TUNISIENNE SARL', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text('Avenue Habib Bourguiba - 1002 Tunis', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text('Tél: 71 000 000 - Matricule Fiscal: 12345678/A/M/000', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text('Code CNSS: TN12345678 - Numéro Employeur: 987654321', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Ligne séparatrice
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // ================= INFORMATIONS EMPLOYÉ =================
      const currentDate = new Date();
      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Période de paie: ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`, margin, yPosition);
      yPosition += 12;

      // Informations employé sur 2 lignes
      const col1X = margin;
      const col2X = pageWidth / 2;

      // Ligne 1
      doc.setFont('helvetica', 'bold');
      doc.text('Matricule:', col1X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.employee.matricule || this.employee.id || '-', col1X + 25, yPosition);

      doc.setFont('helvetica', 'bold');
      doc.text('Nom & Prénom:', col2X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.employee.username || '-', col2X + 30, yPosition);

      yPosition += 8;

      // Ligne 2
      doc.setFont('helvetica', 'bold');
      doc.text('CNSS:', col1X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.employee.cnssNumber || 'Non renseigné', col1X + 15, yPosition);

      doc.setFont('helvetica', 'bold');
      doc.text('Fonction:', col2X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.employee.position || '-', col2X + 20, yPosition);

      yPosition += 8;

      // Ligne 3
      doc.setFont('helvetica', 'bold');
      doc.text('Date embauche:', col1X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.formatDate(this.employee.hireDate), col1X + 35, yPosition);

      doc.setFont('helvetica', 'bold');
      doc.text('N° CIN:', col2X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.employee.cin || '-', col2X + 18, yPosition);

      yPosition += 15;

      // ================= CALCULS =================
      const baseSalary = this.employee.salary || 0;
      const transport = this.employee.transportAllowance || 0;
      const family = this.employee.familyAllowance || 0;
      const bonuses = this.employee.otherBonuses || 0;
      const totalBrut = baseSalary + transport + family + bonuses;

      const cnssEmployee = totalBrut * 0.0918;
      const retirement = totalBrut * 0.035;
      const healthInsurance = totalBrut * 0.02;
      const totalCotisations = cnssEmployee + retirement + healthInsurance;

      const taxableIncome = totalBrut - totalCotisations;
      const irpp = this.calculateIRPP(taxableIncome);
      const netAPayer = taxableIncome - irpp;

      // ================= TABLEAU GAINS ET RETENUES =================
      const tableWidth = pageWidth - 2 * margin;
      const colWidth = tableWidth / 2;
      const col1XTable = margin;
      const col2XTable = margin + colWidth;
      const rowHeight = 8;

      // Fonction pour dessiner une ligne de tableau
      const drawRow = (col1Label: string, col1Value: string, col2Label: string, col2Value: string, isHeader: boolean = false) => {
        // Bordures
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);

        // Colonne 1
        doc.rect(col1XTable, yPosition, colWidth, rowHeight);
        // Colonne 2
        doc.rect(col2XTable, yPosition, colWidth, rowHeight);

        if (isHeader) {
          // Fond des en-têtes
          doc.setFillColor(41, 128, 185);
          doc.rect(col1XTable, yPosition, colWidth, rowHeight, 'F');
          doc.rect(col2XTable, yPosition, colWidth, rowHeight, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text(col1Label, col1XTable + colWidth / 2, yPosition + 5, { align: 'center' });
          doc.text(col2Label, col2XTable + colWidth / 2, yPosition + 5, { align: 'center' });
        } else {
          doc.setTextColor(0, 0, 0);

          // Colonne 1
          doc.setFont('helvetica', 'bold');
          doc.text(col1Label, col1XTable + 5, yPosition + 5);
          doc.setFont('helvetica', 'normal');
          doc.text(col1Value, col1XTable + colWidth - 5, yPosition + 5, { align: 'right' });

          // Colonne 2
          doc.setFont('helvetica', 'bold');
          doc.text(col2Label, col2XTable + 5, yPosition + 5);
          doc.setFont('helvetica', 'normal');
          doc.text(col2Value, col2XTable + colWidth - 5, yPosition + 5, { align: 'right' });
        }

        yPosition += rowHeight;
      };

      // Fonction pour dessiner une ligne de total
      const drawTotalRow = (col1Label: string, col1Value: string, col2Label: string, col2Value: string) => {
        // Bordures
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);

        // Colonne 1
        doc.rect(col1XTable, yPosition, colWidth, rowHeight);
        // Colonne 2
        doc.rect(col2XTable, yPosition, colWidth, rowHeight);

        // Fond des totaux
        doc.setFillColor(240, 248, 255);
        doc.rect(col1XTable, yPosition, colWidth, rowHeight, 'F');
        doc.rect(col2XTable, yPosition, colWidth, rowHeight, 'F');

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');

        // Colonne 1
        doc.text(col1Label, col1XTable + 5, yPosition + 5);
        doc.text(col1Value, col1XTable + colWidth - 5, yPosition + 5, { align: 'right' });

        // Colonne 2
        doc.text(col2Label, col2XTable + 5, yPosition + 5);
        doc.text(col2Value, col2XTable + colWidth - 5, yPosition + 5, { align: 'right' });

        yPosition += rowHeight;
      };

      // En-têtes du tableau
      drawRow('GAINS ET AVANTAGES', '', 'RETENUES SOCIALES', '', true);

      // Lignes de données
      drawRow('Salaire de base', `${baseSalary.toFixed(3)} TND`, 'CNSS (9.18% employé)', `${cnssEmployee.toFixed(3)} TND`);
      drawRow('Indemnité transport', `${transport.toFixed(3)} TND`, 'Retraite (3.5%)', `${retirement.toFixed(3)} TND`);
      drawRow('Allocation familiale', `${family.toFixed(3)} TND`, 'Assurance maladie (2%)', `${healthInsurance.toFixed(3)} TND`);
      drawRow('Autres primes', `${bonuses.toFixed(3)} TND`, 'Impôt sur le revenu (IRPP)', `${irpp.toFixed(3)} TND`);

      // Lignes de total
      drawTotalRow('TOTAL BRUT', `${totalBrut.toFixed(3)} TND`, 'TOTAL RETENUES', `${(totalCotisations + irpp).toFixed(3)} TND`);

      yPosition += 15;

      // ================= TABLEAU RÉCAPITULATIF =================
      // Fonction pour le tableau récapitulatif
      const drawRecapRow = (label: string, value: string, isHeader: boolean = false, isTotal: boolean = false) => {
        const recapRowHeight = 8;

        // Bordures
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        doc.rect(margin, yPosition, tableWidth, recapRowHeight);

        if (isHeader) {
          // Fond en-tête
          doc.setFillColor(41, 128, 185);
          doc.rect(margin, yPosition, tableWidth, recapRowHeight, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text(label, pageWidth / 2, yPosition + 5, { align: 'center' });
        } else if (isTotal) {
          // Fond total
          doc.setFillColor(200, 230, 201);
          doc.rect(margin, yPosition, tableWidth, recapRowHeight, 'F');
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin + 5, yPosition + 5);
          doc.text(value, margin + tableWidth - 5, yPosition + 5, { align: 'right' });
        } else {
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin + 5, yPosition + 5);
          doc.setFont('helvetica', 'normal');
          doc.text(value, margin + tableWidth - 5, yPosition + 5, { align: 'right' });
        }

        yPosition += recapRowHeight;
      };

      // Tableau récapitulatif
      drawRecapRow('RÉCAPITULATIF', '', true);
      drawRecapRow('Salaire brut', `${totalBrut.toFixed(3)} TND`);
      drawRecapRow('Total retenues sociales', `${totalCotisations.toFixed(3)} TND`);
      drawRecapRow('Impôt sur le revenu (IRPP)', `${irpp.toFixed(3)} TND`);
      drawRecapRow('NET À PAYER', `${netAPayer.toFixed(3)} TND`, false, true);

      yPosition += 15;

      // ================= SIGNATURES =================
      doc.setFontSize(10);
      doc.text('Signature employé', margin, yPosition);
      doc.text('Signature employeur', pageWidth - margin - 50, yPosition);

      doc.setLineWidth(0.3);
      doc.line(margin, yPosition + 5, margin + 50, yPosition + 5);
      doc.line(pageWidth - margin - 50, yPosition + 5, pageWidth - margin, yPosition + 5);

      // ================= TÉLÉCHARGEMENT =================
      const fileName = `Fiche_Paie_${this.employee.username || 'Employe'}_${monthNames[currentDate.getMonth()]}_${currentDate.getFullYear()}.pdf`;
      doc.save(fileName);

      this.successMessage = 'Fiche de paie générée avec succès !';
      setTimeout(() => this.successMessage = '', 3000);

    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      this.errorMessage = 'Erreur lors de la génération de la fiche de paie. Vérifiez la console.';
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }
}
