import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CongeService, CongeRequest } from '../../services/conge.service';

@Component({
  selector: 'app-submit-conge',
  standalone: true,
  imports: [ ReactiveFormsModule ],
  templateUrl: './submit-conge.html',
  styleUrl: './submit-conge.css',
})
export class SubmitCongeComponent implements OnInit {
  congeForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  duration = 0;
  employeeId = ''; // Get this from authentication service or session

  constructor(
    private fb: FormBuilder,
    private congeService: CongeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employeeId = localStorage.getItem('employeeId') || '';

    this.initForm();
    this.setupDateWatchers();
  }

  private initForm(): void {
    this.congeForm = this.fb.group({
      type: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]]
    }, {
      validators: this.dateRangeValidator
    });
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (!startDate || !endDate) {
      return null;
    }

    return new Date(endDate) >= new Date(startDate) ? null : { dateRangeInvalid: true };
  }

  private setupDateWatchers(): void {
    this.congeForm.get('startDate')?.valueChanges.subscribe(() => {
      this.calculateDuration();
    });

    this.congeForm.get('endDate')?.valueChanges.subscribe(() => {
      this.calculateDuration();
    });
  }

  private calculateDuration(): void {
    const startDate = this.congeForm.get('startDate')?.value;
    const endDate = this.congeForm.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      this.duration = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    } else {
      this.duration = 0;
    }
  }

  get type() {
    return this.congeForm.get('type');
  }

  get startDate() {
    return this.congeForm.get('startDate');
  }

  get endDate() {
    return this.congeForm.get('endDate');
  }

  get reason() {
    return this.congeForm.get('reason');
  }

  onSubmit(): void {
    if (this.congeForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const request: CongeRequest = {
        type: this.congeForm.value.type,
        startDate: this.congeForm.value.startDate,
        endDate: this.congeForm.value.endDate,
        reason: this.congeForm.value.reason
      };

      this.congeService.submitCongeRequest(this.employeeId, request).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Leave request submitted successfully! Redirecting...';
          this.congeForm.reset();

          // Redirect to conge list after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/conges/my-requests']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error || 'Failed to submit leave request. Please try again.';
          console.error('Submit conge error:', error);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.congeForm.controls).forEach(key => {
        this.congeForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/conges/my-requests']);
  }
}
