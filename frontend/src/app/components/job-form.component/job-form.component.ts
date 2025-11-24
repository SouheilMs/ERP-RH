import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { JobOfferService, JobOfferRequest } from '../../services/job-offer.service';

@Component({
  selector: 'app-job-form.component',
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
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.jobForm = this.createForm();
  }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.jobId;

    // Test de connexion au backend
    this.testBackendConnection();

    if (this.isEdit && this.jobId) {
      this.loadJobOffer();
    }
  }

  testBackendConnection(): void {
    console.log('Testing backend connection...');
    this.jobService.testBackendConnection().subscribe({
      next: (response) => {
        console.log(' Backend connection successful:', response);
      },
      error: (error) => {
        console.error(' Backend connection failed:', error);
        this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 8081.';
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      department: ['', Validators.required],
      location: ['', Validators.required],
      contractType: ['', Validators.required],
      requirements: ['', [Validators.required, Validators.minLength(20)]],
      responsibilities: ['', [Validators.required, Validators.minLength(20)]],
      benefits: ['', [Validators.required, Validators.minLength(20)]],
      closingDate: ['', [Validators.required, this.futureDateValidator]],
      experienceLevel: ['', Validators.required],
      educationRequired: ['', Validators.required],
      tags: ['']
    });
  }

  // Validateur pour s'assurer que la date est dans le futur
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
        // Convertit la date du backend (LocalDateTime) en format date simple pour l'input
        const closingDate = job.closingDate ? job.closingDate.split('T')[0] : '';
        
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
    if (this.jobForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      const formValue = this.jobForm.value;
      
      // Nettoyer les tags
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
        closingDate: formValue.closingDate, // Le service formatera cette date
        experienceLevel: formValue.experienceLevel,
        educationRequired: formValue.educationRequired,
        tags: tags,
        isActive: true
      };

      console.log('Submitting job offer request:', request);

      // Utiliser un ID réel - à remplacer par votre logique d'authentification
      const publisherId = this.getCurrentUserId();

      if (this.isEdit && this.jobId) {
        this.jobService.updateJobOffer(this.jobId, request).subscribe({
          next: (response) => {
            // console.log(' Job offer updated successfully:', response);
            this.submitting = false;
            alert('Offre mise à jour avec succès!');
            this.router.navigate(['/jobs']);
          },
          error: (error) => {
            // console.error(' Error updating job offer:', error);
            this.errorMessage = `Erreur lors de la mise à jour: ${error.message}`;
            this.submitting = false;
          }
        });
      } else {
        this.jobService.createJobOffer(request, publisherId).subscribe({
          next: (response) => {
            console.log(' Job offer created successfully:', response);
            this.submitting = false;
            alert('Offre créée avec succès!');
            this.router.navigate(['/jobs']);
          },
          error: (error) => {
            // console.error(' Error creating job offer:', error);
            this.errorMessage = `Erreur lors de la création: ${error.message}`;
            this.submitting = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      
      // Afficher les erreurs de validation spécifiques
      const closingDateError = this.jobForm.get('closingDate')?.errors;
      if (closingDateError?.['pastDate']) {
        this.errorMessage += ' - La date de clôture doit être dans le futur';
      }
    }
  }

  private getCurrentUserId(): string {
    // À REMPLACER par votre logique d'authentification réelle
    // Pour le moment, utilisez un ID valide pour votre base de données
    // Vérifiez dans votre base MongoDB quel ID d'employé existe
    return '65a1b2c3d4e5f6a7b8c9d0e1'; // Remplacez par un ID réel
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
}