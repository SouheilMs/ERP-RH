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
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.jobForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('🔐 JobFormComponent - Initialisation');
    
    // ✅ Détection du mode (création ou édition)
    this.detectFormMode();
    
    // Debug
    this.debugFormMode();
  }

  // ✅ NOUVELLE MÉTHODE : Détection correcte du mode
  private detectFormMode(): void {
    // Récupérer l'ID depuis les paramètres de route
    this.jobId = this.route.snapshot.paramMap.get('id');
    
    // Vérifier l'URL actuelle
    const currentUrl = this.router.url;
    
    // Déterminer le mode en fonction de l'URL et de l'ID
    this.isEdit = currentUrl.includes('/edit') && !!this.jobId;

    if (this.isEdit && this.jobId) {
      console.log('🔄 Mode ÉDITION détecté - Chargement de l\'offre:', this.jobId);
      this.loadJobOffer();
    } else {
      console.log('🆕 Mode CRÉATION détecté');
      this.isEdit = false;
      this.jobId = null;
    }
  }

  // ✅ MÉTHODE DE DEBUG
  private debugFormMode(): void {
    console.log('🔍 Debug Form Mode:');
    console.log('  - URL complète:', this.router.url);
    console.log('  - ID depuis route:', this.jobId);
    console.log('  - Mode Édition:', this.isEdit);
    console.log('  - User connecté:', this.authService.isLoggedIn());
    console.log('  - Rôles user:', this.authService.getUserRoles());
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
    selectedDate.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { pastDate: true };
  }

  loadJobOffer(): void {
    if (!this.jobId) {
      console.error('❌ Impossible de charger l\'offre: jobId est null');
      this.errorMessage = 'ID d\'offre non valide';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    console.log('🔄 Chargement de l\'offre avec ID:', this.jobId);
    
    this.jobService.getJobOfferById(this.jobId).subscribe({
      next: (job) => {
        console.log('✅ Offre chargée avec succès:', job.title);
        
        // Formater la date de clôture
        const closingDate = job.closingDate ? job.closingDate.split('T')[0] : '';
        this.currentTags = job.tags || []; 
        
        // Remplir le formulaire avec les données
        this.jobForm.patchValue({
          title: job.title || '',
          description: job.description || '',
          department: job.department || '',
          location: job.location || '',
          contractType: job.contractType || '',
          requirements: job.requirements || '',
          responsibilities: job.responsibilities || '',
          benefits: job.benefits || '',
          closingDate: closingDate,
          experienceLevel: job.experienceLevel || '',
          educationRequired: job.educationRequired || '',
          tags: this.currentTags.join(', ') || ''
        });
        
        this.loading = false;
        console.log('✅ Formulaire rempli avec les données de l\'offre');
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de l\'offre:', error);
        this.errorMessage = `Erreur lors du chargement: ${error.message}`;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    console.log('📤 Soumission du formulaire:');
    console.log('  - Mode:', this.isEdit ? 'ÉDITION' : 'CRÉATION');
    console.log('  - ID:', this.jobId);
    console.log('  - Formulaire valide:', this.jobForm.valid);
    
    if (this.jobForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      const formValue = this.jobForm.value;
      
      // Gérer les tags
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

      console.log('📦 Données à envoyer:', request);

      if (this.isEdit && this.jobId) {
        // ✅ MODE ÉDITION
        console.log('🔄 Mise à jour de l\'offre:', this.jobId);
        this.jobService.updateJobOffer(this.jobId, request).subscribe({
          next: (response) => {
            console.log('✅ Offre mise à jour avec succès:', response.title);
            this.submitting = false;
            alert('Offre mise à jour avec succès!');
            this.router.navigate(['/jobs']);
          },
          error: (error) => {
            console.error('❌ Erreur lors de la mise à jour:', error);
            this.errorMessage = `Erreur lors de la mise à jour: ${error.message}`;
            this.submitting = false;
          }
        });
      } else {
        // ✅ MODE CRÉATION
        console.log('🆕 Création d\'une nouvelle offre');
        const publisherId = this.getCurrentUserId();
        if (!publisherId) {
          this.errorMessage = 'Utilisateur non connecté';
          this.submitting = false;
          return;
        }
        
        this.jobService.createJobOffer(request, publisherId).subscribe({
          next: (response) => {
            console.log('✅ Offre créée avec succès:', response.title);
            this.submitting = false;
            alert('Offre créée avec succès!');
            this.router.navigate(['/jobs']);
          },
          error: (error) => {
            console.error('❌ Erreur lors de la création:', error);
            this.errorMessage = `Erreur lors de la création: ${error.message}`;
            this.submitting = false;
          }
        });
      }
    } else {
      console.log('❌ Formulaire invalide');
      this.markFormGroupTouched();
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      this.checkFormValidity();
    }
  }

  checkFormValidity(): void {
    Object.keys(this.jobForm.controls).forEach(key => {
      const control = this.jobForm.get(key);
      if (control?.invalid) {
        console.log(`Champ invalide: ${key}`, {
          errors: control.errors,
          value: control.value
        });
      }
    });
  }

  private getCurrentUserId(): string {
    const currentUser = this.authService.getUser();
  
    if (currentUser && currentUser.id) {
      console.log('🔑 ID utilisateur trouvé:', currentUser.id);
      return currentUser.id;
    }
    
    // Fallback: récupérer depuis localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('🔑 ID utilisateur depuis localStorage:', user.id);
        return user.id;
      } catch (error) {
        console.error('❌ Erreur parsing user data:', error);
      }
    }
    
    throw new Error('Aucun utilisateur connecté. Veuillez vous connecter d\'abord.');
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
    console.log('🔍 État du formulaire:');
    console.log('  - Mode:', this.isEdit ? 'ÉDITION' : 'CRÉATION');
    console.log('  - ID:', this.jobId);
    console.log('  - Formulaire valide:', this.jobForm.valid);
    console.log('  - Formulaire touché:', this.jobForm.touched);
    console.log('  - Formulaire modifié:', this.jobForm.dirty);
    
    Object.keys(this.jobForm.controls).forEach(key => {
      const control = this.jobForm.get(key);
      console.log(`  - ${key}: valide=${control?.valid}, touché=${control?.touched}, valeur=`, control?.value);
    });
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