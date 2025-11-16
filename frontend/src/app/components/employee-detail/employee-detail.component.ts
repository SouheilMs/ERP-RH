import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EmployeeServices, Employee, Formation } from '../../services/employee.services';
import jsPDF from 'jspdf';

// Define pipe directly in component
@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeUrlPipe],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  loading = true;
  errorMessage = '';
  successMessage = '';

  // Formation modal
  showFormationModal = false;
  newFormation: any = { name: '', location: '', startDate: '', endDate: '' };
  selectedCertificate: File | null = null;
  formationSuccessMessage = '';
  formationErrorMessage = '';

  // Photo
  selectedPhoto: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  // Payslip
  showPayslipModal = false;
  currentPdfUrl: string | null = null;
  payslipLoading = false;

  // Formation PDF
  showFormationPdfModal = false;
  currentFormationPdfUrl: string | null = null;
  currentFormationTitle: string = '';
  formationPdfLoading = false;

  // Confirmation modals
  showDeleteConfirmation = false;
  formationToDelete: string | undefined;
  showUpdateConfirmation = false;
// Success modals
  showDeleteSuccess = false;
  showUploadSuccess = false;
  showUpdateSuccess = false;
  showFormationSuccess = false;

// Error modal
  showErrorModal = false;
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
        this.errorMessage = "Unable to retrieve employee";
        this.loading = false;
      }
    });
  }

  getPhotoUrl(): string {
    if (this.previewUrl) return this.previewUrl as string;
    if (this.employee?.photoId) return this.employeeService.getEmployeePhoto(this.employee.id!);
    return 'assets/default-profile.png';
  }

  // ================= UPDATE EMPLOYEE WITH CONFIRMATION =================
  onUpdateSubmit(event: Event) {
    event.preventDefault();
    this.showUpdateConfirmation = true;
  }

  confirmUpdate() {
    this.showUpdateConfirmation = false;

    if (!this.employee?.id) return;

    const updatedData: Employee = {
      username: this.employee.username,
      email: this.employee.email,
      phone: this.employee.phone,
      salary: this.employee.salary,
      status: this.employee.status,
      hireDate: this.employee.hireDate,

      // New fields
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
        this.successMessage = 'Update successful!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Error during update.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  cancelUpdate() {
    this.showUpdateConfirmation = false;
  }

  // ================= PHOTO UPLOAD =================
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
        this.successMessage = "Photo updated successfully!";
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = "Error uploading photo.";
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // ================= FORMATION MANAGEMENT =================
  onCertificateSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedCertificate = file;
      this.formationErrorMessage = '';
    } else {
      this.selectedCertificate = null;
      this.formationErrorMessage = 'Please select a PDF file.';
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
        this.formationSuccessMessage = 'Formation added successfully!';
        setTimeout(() => (this.formationSuccessMessage = ''), 3000);
      },
      error: () => {
        this.formationErrorMessage = 'Error adding formation.';
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

  // ================= DELETE FORMATION WITH CONFIRMATION =================
  deleteFormation(formationId: string | undefined) {
    if (!formationId || !this.employee?.id) return;

    this.formationToDelete = formationId;
    this.showDeleteConfirmation = true;
  }

  confirmDelete() {
    if (!this.formationToDelete || !this.employee?.id) return;

    this.employeeService.deleteFormation(this.employee.id, this.formationToDelete).subscribe({
      next: () => {
        this.employee!.formations = this.employee!.formations?.filter((f: Formation) => f.id !== this.formationToDelete);
        this.successMessage = 'Formation deleted successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        this.closeDeleteConfirmation();
      },
      error: () => {
        this.errorMessage = 'Error deleting formation.';
        setTimeout(() => this.errorMessage = '', 3000);
        this.closeDeleteConfirmation();
      }
    });
  }

  cancelDelete() {
    this.closeDeleteConfirmation();
  }

  closeDeleteConfirmation() {
    this.showDeleteConfirmation = false;
    this.formationToDelete = undefined;
  }

  // ================= VIEW FORMATION PDF =================
  viewFormationCertificate(formation: Formation) {
    if (!formation.certificateId) {
      alert('No certificate available for this formation');
      return;
    }

    this.formationPdfLoading = true;
    this.currentFormationTitle = `Certificate - ${formation.name}`;

    this.employeeService.getFormationCertificateBlob(formation.certificateId).subscribe({
      next: (pdfBlob: Blob) => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        this.currentFormationPdfUrl = pdfUrl;
        this.showFormationPdfModal = true;
        this.formationPdfLoading = false;
      },
      error: (err) => {
        console.error('Error loading formation PDF:', err);
        this.errorMessage = 'Unable to load certificate';
        this.formationPdfLoading = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  printFormationCertificate() {
    if (!this.currentFormationPdfUrl) return;

    const printWindow = window.open(this.currentFormationPdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  onFormationPdfLoad() {
    console.log('Formation PDF loaded successfully');
  }

  closeFormationPdfModal() {
    this.showFormationPdfModal = false;
    if (this.currentFormationPdfUrl) {
      URL.revokeObjectURL(this.currentFormationPdfUrl);
      this.currentFormationPdfUrl = null;
    }
  }

  downloadFormationCertificate() {
    if (!this.currentFormationPdfUrl || !this.currentFormationTitle) return;

    const link = document.createElement('a');
    link.href = this.currentFormationPdfUrl;
    link.download = `${this.currentFormationTitle}.pdf`;
    link.click();
  }

  // ================= PAYSLIP WITH TABLE =================
  viewPayslipPDF() {
    if (!this.employee?.id) {
      alert('Employee information not yet loaded.');
      return;
    }

    this.payslipLoading = true;
    this.generatePayslipWithTable();
  }

  generatePayslipWithTable() {
    if (!this.employee) {
      alert('Employee information not yet loaded.');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 20;

      // ================= HEADER =================
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYSLIP - TUNISIA', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Company information
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('TUNISIAN COMPANY SARL', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text('Avenue Habib Bourguiba - 1002 Tunis', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text('Tel: 71 000 000 - Tax ID: 12345678/A/M/000', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text('CNSS Code: TN12345678 - Employer Number: 987654321', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Separator line
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // ================= EMPLOYEE INFORMATION =================
      const currentDate = new Date();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Pay Period: ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`, margin, yPosition);
      yPosition += 12;

      // Employee information on 2 lines
      const col1X = margin;
      const col2X = pageWidth / 2;

      // Line 1
      doc.setFont('helvetica', 'bold');
      doc.text('Employee ID:', col1X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.employee.matricule || this.employee.id || '-', col1X + 30, yPosition);

      doc.setFont('helvetica', 'bold');
      doc.text('Full Name:', col2X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.employee.username || '-', col2X + 30, yPosition);

      yPosition += 8;

      // Line 2
      doc.setFont('helvetica', 'bold');
      doc.text('CNSS Number:', col1X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.employee.cnssNumber || 'Not provided', col1X + 35, yPosition);

      doc.setFont('helvetica', 'bold');
      doc.text('Position:', col2X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.employee.status|| '-', col2X + 25, yPosition);

      yPosition += 8;

      // Line 3
      doc.setFont('helvetica', 'bold');
      doc.text('Hire Date:', col1X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.formatDate(this.employee.hireDate), col1X + 30, yPosition);

      doc.setFont('helvetica', 'bold');
      doc.text('ID Number:', col2X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.employee.cin || '-', col2X + 30, yPosition);

      yPosition += 15;

      // ================= CALCULATIONS =================
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

      // ================= EARNINGS AND DEDUCTIONS TABLE =================
      const tableWidth = pageWidth - 2 * margin;
      const colWidth = tableWidth / 2;
      const col1XTable = margin;
      const col2XTable = margin + colWidth;
      const rowHeight = 8;

      // Function to draw a table row
      const drawRow = (col1Label: string, col1Value: string, col2Label: string, col2Value: string, isHeader: boolean = false) => {
        // Borders
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);

        // Column 1
        doc.rect(col1XTable, yPosition, colWidth, rowHeight);
        // Column 2
        doc.rect(col2XTable, yPosition, colWidth, rowHeight);

        if (isHeader) {
          // Header background
          doc.setFillColor(41, 128, 185);
          doc.rect(col1XTable, yPosition, colWidth, rowHeight, 'F');
          doc.rect(col2XTable, yPosition, colWidth, rowHeight, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text(col1Label, col1XTable + colWidth / 2, yPosition + 5, { align: 'center' });
          doc.text(col2Label, col2XTable + colWidth / 2, yPosition + 5, { align: 'center' });
        } else {
          doc.setTextColor(0, 0, 0);

          // Column 1
          doc.setFont('helvetica', 'bold');
          doc.text(col1Label, col1XTable + 5, yPosition + 5);
          doc.setFont('helvetica', 'normal');
          doc.text(col1Value, col1XTable + colWidth - 5, yPosition + 5, { align: 'right' });

          // Column 2
          doc.setFont('helvetica', 'bold');
          doc.text(col2Label, col2XTable + 5, yPosition + 5);
          doc.setFont('helvetica', 'normal');
          doc.text(col2Value, col2XTable + colWidth - 5, yPosition + 5, { align: 'right' });
        }

        yPosition += rowHeight;
      };

      // Function to draw a total row
      const drawTotalRow = (col1Label: string, col1Value: string, col2Label: string, col2Value: string) => {
        // Borders
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);

        // Column 1
        doc.rect(col1XTable, yPosition, colWidth, rowHeight);
        // Column 2
        doc.rect(col2XTable, yPosition, colWidth, rowHeight);

        // Total background
        doc.setFillColor(240, 248, 255);
        doc.rect(col1XTable, yPosition, colWidth, rowHeight, 'F');
        doc.rect(col2XTable, yPosition, colWidth, rowHeight, 'F');

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');

        // Column 1
        doc.text(col1Label, col1XTable + 5, yPosition + 5);
        doc.text(col1Value, col1XTable + colWidth - 5, yPosition + 5, { align: 'right' });

        // Column 2
        doc.text(col2Label, col2XTable + 5, yPosition + 5);
        doc.text(col2Value, col2XTable + colWidth - 5, yPosition + 5, { align: 'right' });

        yPosition += rowHeight;
      };

      // Table headers
      drawRow('EARNINGS AND ALLOWANCES', '', 'SOCIAL DEDUCTIONS', '', true);

      // Data rows
      drawRow('Base salary', `${baseSalary.toFixed(3)} TND`, 'CNSS (9.18% employee)', `${cnssEmployee.toFixed(3)} TND`);
      drawRow('Transport allowance', `${transport.toFixed(3)} TND`, 'Retirement (3.5%)', `${retirement.toFixed(3)} TND`);
      drawRow('Family allowance', `${family.toFixed(3)} TND`, 'Health insurance (2%)', `${healthInsurance.toFixed(3)} TND`);
      drawRow('Other bonuses', `${bonuses.toFixed(3)} TND`, 'Income tax (IRPP)', `${irpp.toFixed(3)} TND`);

      // Total rows
      drawTotalRow('TOTAL GROSS', `${totalBrut.toFixed(3)} TND`, 'TOTAL DEDUCTIONS', `${(totalCotisations + irpp).toFixed(3)} TND`);

      yPosition += 15;

      // ================= SUMMARY TABLE =================
      // Function for summary table
      const drawRecapRow = (label: string, value: string, isHeader: boolean = false, isTotal: boolean = false) => {
        const recapRowHeight = 8;

        // Borders
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        doc.rect(margin, yPosition, tableWidth, recapRowHeight);

        if (isHeader) {
          // Header background
          doc.setFillColor(41, 128, 185);
          doc.rect(margin, yPosition, tableWidth, recapRowHeight, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text(label, pageWidth / 2, yPosition + 5, { align: 'center' });
        } else if (isTotal) {
          // Total background
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

      // Summary table
      drawRecapRow('SUMMARY', '', true);
      drawRecapRow('Gross salary', `${totalBrut.toFixed(3)} TND`);
      drawRecapRow('Total social deductions', `${totalCotisations.toFixed(3)} TND`);
      drawRecapRow('Income tax (IRPP)', `${irpp.toFixed(3)} TND`);
      drawRecapRow('NET PAY', `${netAPayer.toFixed(3)} TND`, false, true);

      yPosition += 15;

      // ================= SIGNATURES =================
      doc.setFontSize(10);
      doc.text('Employee signature', margin, yPosition);
      doc.text('Employer signature', pageWidth - margin - 50, yPosition);

      doc.setLineWidth(0.3);
      doc.line(margin, yPosition + 5, margin + 50, yPosition + 5);
      doc.line(pageWidth - margin - 50, yPosition + 5, pageWidth - margin, yPosition + 5);

      // ================= CREATE BLOB URL FOR DISPLAY =================
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Display in modal
      this.currentPdfUrl = pdfUrl;
      this.showPayslipModal = true;
      this.payslipLoading = false;

      this.successMessage = 'Payslip generated successfully!';
      setTimeout(() => this.successMessage = '', 3000);

    } catch (error: any) {
      console.error('Detailed error:', error);
      this.errorMessage = 'Error generating payslip. Check console.';
      this.payslipLoading = false;
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  // Method to download generated PDF
  downloadPayslip() {
    if (!this.currentPdfUrl || !this.employee) return;

    const link = document.createElement('a');
    link.href = this.currentPdfUrl;

    const currentDate = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    link.download = `Payslip_${this.employee.username || 'Employee'}_${monthNames[currentDate.getMonth()]}_${currentDate.getFullYear()}.pdf`;
    link.click();
  }

  // Method to print
  printPayslip() {
    if (!this.currentPdfUrl) return;

    const printWindow = window.open(this.currentPdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  // Close modal
  closePayslipModal() {
    this.showPayslipModal = false;
    if (this.currentPdfUrl) {
      URL.revokeObjectURL(this.currentPdfUrl);
      this.currentPdfUrl = null;
    }
    this.payslipLoading = false;
  }

  // Method to calculate IRPP according to Tunisian scale
  calculateIRPP(taxableIncome: number): number {
    let irpp = 0;

    if (taxableIncome <= 5000) {
      irpp = 0;
    } else if (taxableIncome <= 20000) {
      irpp = (taxableIncome - 5000) * 0.26;
    } else if (taxableIncome <= 30000) {
      irpp = (15000 * 0.26) + (taxableIncome - 20000) * 0.28;
    } else if (taxableIncome <= 50000) {
      irpp = (15000 * 0.26) + (10000 * 0.28) + (taxableIncome - 30000) * 0.32;
    } else {
      irpp = (15000 * 0.26) + (10000 * 0.28) + (20000 * 0.32) + (taxableIncome - 50000) * 0.35;
    }

    return irpp;
  }

  // Method to format date
  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US');
    } catch (error) {
      return '-';
    }
  }

  // Method called when PDF is loaded
  onPdfLoad() {
    console.log('Payslip PDF loaded successfully');
  }
  // ================= SUCCESS MODAL METHODS =================
  closeDeleteSuccess() {
    this.showDeleteSuccess = false;
  }

  closeUploadSuccess() {
    this.showUploadSuccess = false;
  }

  closeUpdateSuccess() {
    this.showUpdateSuccess = false;
  }

  closeFormationSuccess() {
    this.showFormationSuccess = false;
  }

  closeErrorModal() {
    this.showErrorModal = false;
    this.errorMessage = '';
  }
}
