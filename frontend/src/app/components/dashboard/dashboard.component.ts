import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
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
  userRole: string = '';
  private rolesSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.updatePermissions();

    // S'abonner aux changements de rôles (au cas où)
    this.rolesSubscription = this.authService.getUserRolesObservable().subscribe(roles => {
      this.updatePermissions();
    });

    // Afficher le rôle uniquement dans la console
    console.log('Connecté en tant que:', this.userRole);
  }

  private updatePermissions() {
    this.canViewEmployees = this.authService.canViewEmployeeList();
    this.userRole = this.authService.getUserRole();

    // Afficher aussi dans la console quand les permissions sont mises à jour
    console.log('Connecté en tant que:', this.userRole);
  }

  // Méthodes pour le template
  isHRUser(): boolean {
    return this.authService.isHR();
  }

  isEmployee(): boolean {
    return this.authService.isEmployee();
  }

  ngOnDestroy() {
    if (this.rolesSubscription) {
      this.rolesSubscription.unsubscribe();
    }
  }
}
