// src/app/components/job-form.component/job-form.component.ts - VERSION CORRIGÉE
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { JobOfferService, JobOfferRequest, JobOffer } from '../../services/job-offer.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './job-form.component.html',
  styleUrl: './job-form.component.css',
})
export class JobFormComponent implements OnInit {
  jobForm: FormGroup;
  isEdit = false;
  jobId: string | null = null;
  loading = false;
  submitting = false;
  errorMessage: string = '';

  contractTypes = ['CDI', 'CDD', 'FREELANCE', 'INTERNSHIP', 'PART_TIME'];
  experienceLevels = ['JUNIOR', 'MID', 'SENIOR'];
  educationLevels = ['BAC', 'BAC+2', 'BAC+3', 'BAC+5', 'DOCTORATE'];

  constructor(
    private fb: FormBuilder,
    private jobService: JobOfferService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.jobForm = this.createForm();
  }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.jobId;

    console.log('🔧 JobFormComponent initialized:', {
      isEdit: this.isEdit,
      jobId: this.jobId,
      url: window.location.href
    });

    if (this.isEdit && this.jobId) {
      console.log('🔄 Loading job offer for editing:', this.jobId);
      this.loadJobOffer();
    } else {
      console.log('🆕 Creating new job offer');
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]], // ✅ Réduit de 5 à 3
      description: ['', [Validators.required, Validators.minLength(10)]], // ✅ Réduit de 20 à 10
      department: ['', Validators.required],
      location: ['', Validators.required],
      contractType: ['', Validators.required],
      requirements: ['', [Validators.required, Validators.minLength(10)]], // ✅ Réduit de 20 à 10
      responsibilities: ['', [Validators.required, Validators.minLength(10)]], // ✅ Réduit de 20 à 10
      benefits: ['', [Validators.required, Validators.minLength(10)]], // ✅ Réduit de 20 à 10
      closingDate: ['', [Validators.required, this.futureDateValidator]],
      experienceLevel: ['', Validators.required],
      educationRequired: ['', Validators.required],
      tags: ['']
    });
  }

  private futureDateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { pastDate: true };
  }

  loadJobOffer(): void {
    if (!this.jobId) return;

    this.loading = true;
    this.errorMessage = '';
    
    console.log('🔄 Loading job offer with ID:', this.jobId);
    
    this.jobService.getJobOfferById(this.jobId).subscribe({
      next: (job) => {
        console.log('✅ Job offer loaded successfully:', job);
        console.log('📋 Job data structure:', {
          title: job.title,
          description: job.description?.length,
          department: job.department,
          location: job.location,
          contractType: job.contractType,
          requirements: job.requirements?.length,
          responsibilities: job.responsibilities?.length,
          benefits: job.benefits?.length,
          closingDate: job.closingDate,
          experienceLevel: job.experienceLevel,
          educationRequired: job.educationRequired,
          tags: job.tags
        });
        
        const closingDate = job.closingDate ? job.closingDate.split('T')[0] : '';
        
        this.jobForm.patchValue({
          title: job.title || '',
          description: job.description || '',
          department: job.department || '',
          location: job.location || '',
          contractType: job.contractType || '',
          requirements: job.requirements || '',
          responsibilities: job.responsibilities || '',
          benefits: job.benefits || '',
          closingDate: closingDate || '',
          experienceLevel: job.experienceLevel || '',
          educationRequired: job.educationRequired || '',
          tags: job.tags?.join(', ') || ''
        });
        
        this.loading = false;
        
        // ✅ Vérifiez après le patch
        setTimeout(() => {
          console.log('🔍 After form patch - Form valid:', this.jobForm.valid);
          this.checkFormStatus();
        }, 500);
      },
      error: (error) => {
        console.error('❌ Error loading job offer:', error);
        this.errorMessage = `Erreur lors du chargement: ${error.message}`;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    console.log('🔄 onSubmit() called');
    this.checkFormStatus(); // ✅ Debug avant soumission
    
    if (this.jobForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      const formValue = this.jobForm.value;
      
      const tags = formValue.tags 
        ? formValue.tags.split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0)
        : [];

      const request: JobOfferRequest = {
        title: formValue.title,
        description: formValue.description,
        department: formValue.department,
        location: formValue.location,
        contractType: formValue.contractType,
        requirements: formValue.requirements,
        responsibilities: formValue.responsibilities,
        benefits: formValue.benefits,
        closingDate: formValue.closingDate,
        experienceLevel: formValue.experienceLevel,
        educationRequired: formValue.educationRequired,
        tags: tags,
        isActive: true
      };

      console.log('📤 Submitting job offer request:', request);

      const publisherId = this.getCurrentUserId();
      console.log('👤 Publisher ID:', publisherId);

      if (this.isEdit && this.jobId) {
        console.log('🔄 Updating job offer:', this.jobId);
        this.jobService.updateJobOffer(this.jobId, request).subscribe({
          next: (response) => {
            console.log('✅ Job offer updated successfully:', response);
            this.submitting = false;
            alert('Offre mise à jour avec succès!');
            this.router.navigate(['/jobs']);
          },
          error: (error) => {
            console.error('❌ Error updating job offer:', error);
            this.errorMessage = `Erreur lors de la mise à jour: ${error.message}`;
            this.submitting = false;
          }
        });
      } else {
        console.log('🆕 Creating new job offer');
        this.jobService.createJobOffer(request, publisherId).subscribe({
          next: (response) => {
            console.log('✅ Job offer created successfully:', response);
            this.submitting = false;
            alert('Offre créée avec succès!');
            this.router.navigate(['/jobs']);
          },
          error: (error) => {
            console.error('❌ Error creating job offer:', error);
            this.errorMessage = `Erreur lors de la création: ${error.message}`;
            this.submitting = false;
          }
        });
      }
    } else {
      console.log('❌ Form is invalid - marking all fields as touched');
      this.markFormGroupTouched();
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      
      // ✅ Affichez les erreurs spécifiques
      const closingDateError = this.jobForm.get('closingDate')?.errors;
      if (closingDateError?.['pastDate']) {
        this.errorMessage += ' - La date de clôture doit être dans le futur';
      }
      
      // ✅ Affichez toutes les erreurs pour debug
      Object.keys(this.jobForm.controls).forEach(key => {
        const control = this.jobForm.get(key);
        if (control?.errors) {
          console.log(`❌ Field ${key} errors:`, control.errors);
        }
      });
    }
  }

  private getCurrentUserId(): string {
    const currentUser = this.authService.getUser();
    
    if (currentUser && currentUser.id) {
      console.log('👤 Using current user ID:', currentUser.id);
      return currentUser.id;
    } else {
      console.log('⚠️ Using fallback HR Manager ID');
      return '6923016fa94fa27319f9e429';
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.jobForm.controls).forEach(key => {
      const control = this.jobForm.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.jobForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['minlength']) return `Longueur minimale: ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['pastDate']) return 'La date doit être dans le futur';
    }
    return '';
  }

  // ✅ MÉTHODE DE DEBUG
  checkFormStatus(): void {
    console.log('🔍 Form Status Check:');
    console.log('  - Form valid:', this.jobForm.valid);
    console.log('  - Form touched:', this.jobForm.touched);
    console.log('  - Form dirty:', this.jobForm.dirty);
    
    // Vérifiez chaque champ
    Object.keys(this.jobForm.controls).forEach(key => {
      const control = this.jobForm.get(key);
      console.log(`  - ${key}: valid=${control?.valid}, touched=${control?.touched}, dirty=${control?.dirty}, value=`, control?.value);
      
      if (control?.errors) {
        console.log(`    ❌ Errors:`, control.errors);
      }
    });
  }

  // ✅ MÉTHODE DE TEST
  testSubmit(): void {
    console.log('🧪 Testing form submission...');
    this.checkFormStatus();
    
    // Force la validation
    this.markFormGroupTouched();
    
    if (this.jobForm.valid) {
      console.log('✅ Form is valid - ready to submit');
      this.onSubmit();
    } else {
      console.log('❌ Form is invalid - showing errors:');
      Object.keys(this.jobForm.controls).forEach(key => {
        const control = this.jobForm.get(key);
        if (control?.errors) {
          console.log(`  - ${key}:`, control.errors);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }
}