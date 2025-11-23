import { Component, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  isMobileToggleActive = false;
  userName = 'John Doe';
  
  // Propriétés pour la recherche globale
  searchTerm = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() globalSearch = new EventEmitter<string>(); // Nouvel événement pour recherche globale

  constructor(private router: Router) {}

  // Méthodes pour la recherche
  onSearchChange(): void {
    this.searchChange.emit(this.searchTerm);
    this.globalSearch.emit(this.searchTerm); // Émet également l'événement global
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchChange.emit('');
    this.globalSearch.emit(''); // Efface aussi la recherche globale
  }

  // Méthode pour lancer une recherche globale (peut être appelée depuis d'autres composants)
  performGlobalSearch(term: string): void {
    this.searchTerm = term;
    this.globalSearch.emit(term);
  }

  // Autres méthodes existantes...
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isMobileToggleActive = !this.isMobileToggleActive;
  }

  logout(): void {
    console.log('Logout clicked');
    this.router.navigate(['/login']);
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
}