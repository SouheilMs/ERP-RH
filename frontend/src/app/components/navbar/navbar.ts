import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../notification/notification';

interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NotificationComponent],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isManager = false;
  isAdmin = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.checkUserRole();
  }

  loadCurrentUser(): void {
    // TODO: Replace with actual auth service
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    } else {
      // Fallback for demo
      this.currentUser = {
        id: localStorage.getItem('employeeId') || '1',
        username: localStorage.getItem('username') || 'User',
        email: localStorage.getItem('email') || 'user@example.com',
        role: localStorage.getItem('role') || 'EMPLOYEE'
      };
    }
  }

  /**
   * Check user role for conditional menu items
   */
  checkUserRole(): void {
    const role = this.currentUser?.role || localStorage.getItem('role') || 'EMPLOYEE';
    this.isAdmin = role === 'ADMIN';
    this.isManager = role === 'MANAGER' || this.isAdmin;
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(): string {
    if (!this.currentUser?.username) return 'U';

    const names = this.currentUser.username.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isUserMenuOpen = false;
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  /**
   * Toggle user dropdown menu
   */
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isMobileMenuOpen = false;
  }

  /**
   * Close user menu
   */
  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  /**
   * Close all menus
   */
  closeAllMenus(): void {
    this.isMobileMenuOpen = false;
    this.isUserMenuOpen = false;
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');

    // Close menus
    this.closeAllMenus();

    // Navigate to login
    this.router.navigate(['/login']);
  }

  /**
   * Close menus on window resize
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth > 768) {
      this.isMobileMenuOpen = false;
    }
  }

  /**
   * Close dropdowns when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInsideNavbar = target.closest('.navbar');

    if (!clickedInsideNavbar) {
      this.closeAllMenus();
    }
  }
}
