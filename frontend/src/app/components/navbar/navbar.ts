// navbar.component.ts
import { Component, HostListener, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service'; // Ajustez le chemin selon votre structure

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink,  FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit, OnDestroy {
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  isMobileToggleActive = false;
  userName = 'Utilisateur';
  userRoles: string[] = [];
  userEmail = '';
  userAvatarInitial = 'U';

  // Propriétés pour la recherche globale
  searchTerm = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() globalSearch = new EventEmitter<string>();

  private authSubscription: Subscription | undefined;
  private rolesSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.subscribeToAuthChanges();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.rolesSubscription) {
      this.rolesSubscription.unsubscribe();
    }
  }

  // Charger les données utilisateur depuis l'AuthService
  loadUserData(): void {
    // Vérifier si l'utilisateur est connecté
    const isLoggedIn = this.authService.isLoggedIn();

    if (isLoggedIn) {
      // Récupérer l'utilisateur depuis le localStorage via AuthService
      const user = this.authService.getUser();

      if (user) {
        console.log('🔄 Chargement données utilisateur:', user);

        // Récupérer le username depuis MongoDB via l'AuthService
        // Priorité: username, puis email, puis valeur par défaut
        this.userName = user.username ||
          user.email?.split('@')[0]?.charAt(0).toUpperCase() +
          user.email?.split('@')[0]?.slice(1) ||
          'Utilisateur';

        this.userEmail = user.email || '';
        this.userRoles = user.roles || [];
        this.userAvatarInitial = this.getUserInitial();

        console.log('✅ Username affiché:', this.userName);
        console.log('📧 Email:', this.userEmail);
        console.log('🎭 Roles:', this.userRoles);
      } else {
        console.warn('⚠️ Aucune donnée utilisateur trouvée');
        this.setDefaultUserData();
      }
    } else {
      this.setDefaultUserData();
    }
  }

  // Définir les données utilisateur par défaut
  private setDefaultUserData(): void {
    this.userName = 'Invité';
    this.userEmail = '';
    this.userRoles = [];
    this.userAvatarInitial = 'U';
  }

  // S'abonner aux changements d'état d'authentification
  private subscribeToAuthChanges(): void {
    // Observer l'état de connexion
    this.authSubscription = this.authService.getAuthStatus().subscribe(
      (loggedIn: boolean) => {
        if (loggedIn) {
          this.loadUserData(); // Recharger les données quand l'utilisateur se connecte
        } else {
          this.setDefaultUserData();
        }
      }
    );

    // Observer les changements de rôles
    this.rolesSubscription = this.authService.getUserRolesObservable().subscribe(
      (roles: string[]) => {
        this.userRoles = roles;
      }
    );
  }

  // Méthode pour obtenir l'initiale du nom (pour avatar)
  getUserInitial(): string {
    if (this.userName && this.userName !== 'Utilisateur' && this.userName !== 'Invité') {
      return this.userName.charAt(0).toUpperCase();
    }
    return 'U';
  }

  // Méthode pour afficher le rôle principal
  getMainRole(): string {
    if (this.userRoles.includes('ROLE_HRMANAGER') || this.userRoles.includes('ROLE_HR_MANAGER')) {
      return 'HR Manager';
    } else if (this.userRoles.includes('ROLE_RH') || this.userRoles.includes('ROLE_HR')) {
      return 'RH';
    } else if (this.userRoles.includes('ROLE_EMPLOYEE')) {
      return 'Employé';
    } else if (this.userRoles.includes('ROLE_ADMIN')) {
      return 'Administrateur';
    } else if (this.userRoles.includes('ROLE_MANAGER')) {
      return 'Manager';
    }
    return 'Utilisateur';
  }

  // Vérifier les permissions pour afficher des liens conditionnels
  canViewDashboard(): boolean {
    return this.authService.canAccessDashboard();
  }

  canViewEmployees(): boolean {
    return this.authService.canViewEmployeeList();
  }

  canViewRoles(): boolean {
    return this.authService.hasAnyRole(['ROLE_HR', 'ROLE_HRMANAGER', 'ROLE_ADMIN', 'ROLE_HR_MANAGER']);
  }

  canViewFormations(): boolean {
    return this.authService.canAccessFormations();
  }

  canViewJobs(): boolean {
    return this.authService.canViewJobs();
  }

  isHRorManager(): boolean {
    return this.authService.isHRorManager();
  }

  // Méthodes pour la recherche
  onSearchChange(): void {
    this.searchChange.emit(this.searchTerm);
    this.globalSearch.emit(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchChange.emit('');
    this.globalSearch.emit('');
    setTimeout(() => {
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    }, 0);
  }

  performGlobalSearch(term: string): void {
    this.searchTerm = term;
    this.globalSearch.emit(term);
  }

  // Navigation vers le profil
  goToProfile(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.router.navigate(['/profile', userId]);
    } else {
      this.router.navigate(['/profile']);
    }
    this.closeAllMenus();
  }

  // Navigation vers les paramètres
  goToSettings(): void {
    this.router.navigate(['/settings']);
    this.closeAllMenus();
  }

  // Méthodes de gestion des menus
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      this.isMobileToggleActive = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isMobileToggleActive = !this.isMobileToggleActive;
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  logout(): void {
    console.log('🚪 Déconnexion en cours...');
    this.authService.logout(); // Utiliser la méthode du service
    this.closeAllMenus();
  }

  closeAllMenus(): void {
    this.isUserMenuOpen = false;
    this.isMobileMenuOpen = false;
    this.isMobileToggleActive = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen = false;
    }

    if (!target.closest('.mobile-toggle') && !target.closest('.mobile-menu')) {
      this.closeAllMenus();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) {
      this.closeAllMenus();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeAllMenus();
    }
  }

  // Focus sur la recherche quand le menu mobile s'ouvre
  onMobileMenuToggle(): void {
    this.toggleMobileMenu();
    if (this.isMobileMenuOpen) {
      setTimeout(() => {
        const mobileSearchInput = document.querySelector('.mobile-search .search-input') as HTMLInputElement;
        if (mobileSearchInput) {
          mobileSearchInput.focus();
        }
      }, 300);
    }
  }
}
