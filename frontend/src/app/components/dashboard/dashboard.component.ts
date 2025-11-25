import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Navbar
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  canViewEmployees: boolean = false;
  canViewJobs: boolean = false; // ✅ NOUVELLE PROPRIÉTÉ POUR LES OFFRES D'EMPLOI
  userRole: string = '';
  currentUserId: string | null = null;
  private rolesSubscription?: Subscription;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.updatePermissions();
    
    this.rolesSubscription = this.authService.getUserRolesObservable().subscribe(roles => {
      this.updatePermissions();
    });

    console.log('👤 User connected with role:', this.userRole);
    
    // ✅ Redirection automatique si employé sur liste des employés
    this.redirectIfNeeded();
  }

  private updatePermissions() {
    this.canViewEmployees = this.authService.canViewEmployeeList();
    this.canViewJobs = this.authService.isHR() || this.authService.isHRManager(); // ✅ PERMISSIONS POUR LES OFFRES
    this.userRole = this.authService.getUserRole();
    this.currentUserId = this.authService.getCurrentUserId();
    
    console.log('🔐 Permissions updated:');
    console.log('   - canViewEmployees:', this.canViewEmployees);
    console.log('   - canViewJobs:', this.canViewJobs); // ✅ LOG
    console.log('   - userRole:', this.userRole);
    console.log('   - currentUserId:', this.currentUserId);
  }

  private redirectIfNeeded() {
    // Si l'employé est sur la liste des employés, le rediriger vers son profil
    if (this.router.url === '/employees' && !this.canViewEmployees && this.currentUserId) {
      console.log('🔄 Redirecting employee to their profile');
      this.router.navigate(['/employees', this.currentUserId]);
    }

    // ✅ Redirection si employé essaie d'accéder aux offres d'emploi
    if (this.router.url === '/jobs' && !this.canViewJobs && this.currentUserId) {
      console.log('🔄 Redirecting employee from jobs to their profile');
      this.router.navigate(['/employees', this.currentUserId]);
    }
  }

  getMyProfileLink(): string {
    return this.currentUserId ? `/employees/${this.currentUserId}` : '/login';
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.rolesSubscription) {
      this.rolesSubscription.unsubscribe();
    }
  }
}