import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LinkedInApiService } from '../../services/linkedin-api.service';
import { LinkedInAuthRequest, LinkedInAuthResponse } from '../../models/linkedin.models';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-linkedin-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    // PrimeNG modules
    ProgressSpinnerModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ToastModule
  ],
  templateUrl: './linkedin-auth.component.html',
  styleUrls: ['./linkedin-auth.component.css'],
  providers: [MessageService]
})
export class LinkedinAuthComponent implements OnInit {
  authForm: FormGroup;
  authResponse: LinkedInAuthResponse | null = null;
  isLoading = false;
  showAuthForm = true;

  constructor(
    private fb: FormBuilder,
    private linkedInService: LinkedInApiService,
    private messageService: MessageService
  ) {
    this.authForm = this.fb.group({
      organizationId: ['', [Validators.required]],
      organizationName: ['', [Validators.required]],
      redirectUri: ['https://www.linkedin.com/developers/tools/oauth/redirect']
    });
  }

  ngOnInit(): void {
    // Vérifier si on est de retour d'un callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      this.handleCallback(code, state);
    }
  }

  initiateAuth(): void {
    if (this.authForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    this.isLoading = true;
    const request: LinkedInAuthRequest = this.authForm.value;

    this.linkedInService.initiateAuth(request).subscribe({
      next: (response) => {
        this.authResponse = response;
        if (response.success && response.authUrl) {
          // Rediriger vers LinkedIn pour l'autorisation
          window.location.href = response.authUrl;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message || 'Échec de l\'authentification'
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de l\'authentification: ' + error.message
        });
        this.isLoading = false;
      }
    });
  }

  handleCallback(code: string, state: string): void {
    this.isLoading = true;
    this.linkedInService.handleCallback(code, state).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Authentification LinkedIn réussie!'
          });
          // Rediriger vers le dashboard
          setTimeout(() => {
            window.location.href = '/linkedin/dashboard';
          }, 2000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message || 'Échec de l\'authentification'
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du callback: ' + error.message
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.authForm.reset();
    this.authResponse = null;
  }
}