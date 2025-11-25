// login.component.ts - VERSION FINALE SANS TESTS
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginRequest: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      console.log('🔄 Tentative de connexion avec:', loginRequest.email);

      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ Connexion réussie:', response);
          console.log('🎯 Rôles utilisateur:', response.roles);

          // Redirection intelligente selon le rôle
          this.redirectBasedOnRole(response.roles, response.id);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('❌ Erreur de connexion détaillée:', error);

          this.errorMessage = this.getErrorMessage(error);
        }
      });
    }
  }

  // Méthode pour obtenir des messages d'erreur détaillés
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Impossible de se connecter au serveur Spring. Vérifiez que le serveur est démarré sur le port 8081.';
    } else if (error.status === 401) {
      return 'Email ou mot de passe incorrect.';
    } else if (error.status === 404) {
      return 'Service d\'authentification non trouvé.';
    } else if (error.status === 500) {
      return 'Erreur interne du serveur. Veuillez réessayer plus tard.';
    } else if (error.error && typeof error.error === 'string') {
      return error.error;
    } else if (error.error && error.error.message) {
      return error.error.message;
    } else if (error.message) {
      return error.message;
    } else {
      return 'Une erreur inconnue est survenue lors de la connexion.';
    }
  }
// Dans login.component.ts
  private redirectBasedOnRole(roles: string[], userId: string) {
    if (roles.includes('ROLE_HR') || roles.includes('ROLE_HRMANAGER')) {
      this.router.navigate(['/employees']);
    } else if (roles.includes('ROLE_EMPLOYEE')) {
      // Rediriger vers "Mon Profil" pour les employés
      this.router.navigate(['/my-profile']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

}
