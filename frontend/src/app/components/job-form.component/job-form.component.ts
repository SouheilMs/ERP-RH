import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { JobOfferService, JobOfferRequest } from '../../services/job-offer.service';
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

  currentTags: string[] = [];
  tagInput: string = '';

  constructor(
    private fb: FormBuilder,
    private jobService: JobOfferService,
    private route: ActivatedRoute,
     private authService: AuthService,
    private router: Router
  ) {
    this.jobForm = this.createForm();
  }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.jobId;

    if (this.isEdit && this.jobId) {
      this.loadJobOffer();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      department: ['', [Validators.required, Validators.minLength(2)]],
      location: ['', [Validators.required, Validators.minLength(2)]],
      contractType: ['', Validators.required],
      requirements: ['', [Validators.required, Validators.minLength(10)]],
      responsibilities: ['', [Validators.required, Validators.minLength(10)]],
      benefits: ['', [Validators.required, Validators.minLength(10)]],
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
    
    return selectedDate >= today ? null : { pastDate: true };
  }

  loadJobOffer(): void {
    if (!this.jobId) return;

    this.loading = true;
    this.errorMessage = '';
    
    this.jobService.getJobOfferById(this.jobId).subscribe({
      next: (job) => {
        const closingDate = job.closingDate ? job.closingDate.split('T')[0] : '';
        this.currentTags = job.tags || []; 
        
        this.jobForm.patchValue({
          title: job.title,
          description: job.description,
          department: job.department,
          location: job.location,
          contractType: job.contractType,
          requirements: job.requirements,
          responsibilities: job.responsibilities,
          benefits: job.benefits,
          closingDate: closingDate,
          experienceLevel: job.experienceLevel,
          educationRequired: job.educationRequired,
          tags: job.tags?.join(', ') || ''
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading job offer:', error);
        this.errorMessage = error.message;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    console.log('Form validation status:', this.jobForm.valid);
    
    if (this.jobForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      const formValue = this.jobForm.value;
      
      const tags = this.currentTags.length > 0 ? this.currentTags : 
                  (formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : []);

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

      console.log('Submitting request:', request);

      if (this.isEdit && this.jobId) {
        this.jobService.updateJobOffer(this.jobId, request).subscribe({
          next: (response) => {
            console.log('Job offer updated successfully:', response);
            this.submitting = false;
            alert('Offre mise à jour avec succès!');
            this.router.navigate(['/jobs']);
          },
          error: (error) => {
            console.error('Error updating job offer:', error);
            this.errorMessage = `Erreur lors de la mise à jour: ${error.message}`;
            this.submitting = false;
          }
        });
      } else {
        const publisherId = this.getCurrentUserId();
        this.jobService.createJobOffer(request, publisherId).subscribe({
          next: (response) => {
            console.log('Job offer created successfully:', response);
            this.submitting = false;
            alert('Offre créée avec succès!');
            this.router.navigate(['/jobs']);
          },
          error: (error) => {
            console.error('Error creating job offer:', error);
            this.errorMessage = `Erreur lors de la création: ${error.message}`;
            this.submitting = false;
          }
        });
      }
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      this.checkFormValidity();
    }
  }

  checkFormValidity(): void {
    Object.keys(this.jobForm.controls).forEach(key => {
      const control = this.jobForm.get(key);
      if (control?.invalid) {
        console.log(`Invalid field: ${key}`, {
          errors: control.errors,
          value: control.value
        });
      }
    });
  }

  private getCurrentUserId(): string {
    const currentUser = this.authService.getUser();
  
  if (currentUser && currentUser.id) {
    console.log('Using current user ID:', currentUser.id);
    return currentUser.id;
  }
  
  // Fallback: try to get from localStorage directly
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    console.log('Using user ID from localStorage:', user.id);
    return user.id;
  }
  
  // If no user is found, throw a clear error
  throw new Error('No user logged in. Please log in first.');
}
  markFormGroupTouched(): void {
    Object.keys(this.jobForm.controls).forEach(key => {
      this.jobForm.get(key)?.markAsTouched();
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

  goBack(): void {
    this.router.navigate(['/jobs']);
  }

  // Méthodes pour gérer les tags
  addTag(tag: string): void {
    const trimmedTag = tag.trim();
    if (trimmedTag && !this.currentTags.includes(trimmedTag)) {
      this.currentTags.push(trimmedTag);
      this.updateTagsFormControl();
    }
  }

  removeTag(tag: string): void {
    this.currentTags = this.currentTags.filter(t => t !== tag);
    this.updateTagsFormControl();
  }

  onTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addCurrentTag();
    }
  }

  onTagInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.tagInput = input.value;
  }

  addCurrentTag(): void {
    if (this.tagInput.trim()) {
      this.addTag(this.tagInput.trim());
      this.tagInput = '';
    }
  }

  updateTagsFormControl(): void {
    this.jobForm.patchValue({
      tags: this.currentTags.join(', ')
    });
  }
}