import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormationService, Formation } from '../../services/formation.service';
import { FormsModule } from '@angular/forms';
import {  StatCard } from '../statistics-card.component/statistics-card.component';

@Component({
  selector: 'app-formation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './formation-list.component.html',
  styleUrls: ['./formation-list.component.css']
})
export class FormationListComponent implements OnInit {
  formations: Formation[] = [];
  filteredFormations: Formation[] = [];
  
  // Statistics
  plannedCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  cancelledCount = 0;
  totalCount = 0;

  // Stats pour le composant séparé
  stats: StatCard[] = [];

  loading = false;
  searchTerm = '';
  selectedStatus = 'ALL';
  selectedCategory = 'ALL';

  statuses = ['ALL', 'PLANIFIED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  categories = ['ALL', 'TECHNICAL', 'SOFT_SKILLS', 'MANAGEMENT', 'COMPLIANCE', 'LANGUAGE'];

  constructor(private formationService: FormationService) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.loading = true;
    this.formationService.getAllFormations().subscribe({
      next: (formations) => {
        this.formations = formations;
        this.filteredFormations = formations;
        this.updateStatistics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.loading = false;
        alert('Error loading formations. Please try again.');
      }
    });
  }

  updateStatistics(): void {
    this.totalCount = this.formations.length;
    this.plannedCount = this.formations.filter(f => f.status === 'PLANIFIED').length;
    this.inProgressCount = this.formations.filter(f => f.status === 'IN_PROGRESS').length;
    this.completedCount = this.formations.filter(f => f.status === 'COMPLETED').length;
    this.cancelledCount = this.formations.filter(f => f.status === 'CANCELLED').length;

    // Mettre à jour les stats pour le composant
    this.stats = [
      {
        title: 'Total',
        value: this.totalCount,
        icon: 'fas fa-chalkboard',
        color: 'total',
        description: 'Total Trainings'
      },
      {
        title: 'Planned',
        value: this.plannedCount,
        icon: 'fas fa-clock',
        color: 'planned',
        description: 'Planned'
      },
      {
        title: 'In Progress',
        value: this.inProgressCount,
        icon: 'fas fa-play-circle',
        color: 'in-progress',
        description: 'In Progress'
      },
      {
        title: 'Completed',
        value: this.completedCount,
        icon: 'fas fa-check-circle',
        color: 'completed',
        description: 'Completed'
      }
    ];
  }

  searchFormations(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.formationService.searchFormations(this.searchTerm).subscribe({
        next: (formations) => {
          this.filteredFormations = formations;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching formations:', error);
          this.loading = false;
        }
      });
    } else {
      this.filteredFormations = this.formations;
      this.applyFilters();
    }
  }

  applyFilters(): void {
    let filtered = this.formations;

    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(f => f.status === this.selectedStatus);
    }

    if (this.selectedCategory !== 'ALL') {
      filtered = filtered.filter(f => f.category === this.selectedCategory);
    }

    this.filteredFormations = filtered;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PLANIFIED': return 'status-badge planned';
      case 'IN_PROGRESS': return 'status-badge in-progress';
      case 'COMPLETED': return 'status-badge completed';
      case 'CANCELLED': return 'status-badge cancelled';
      default: return 'status-badge';
    }
  }

  getProgressPercentage(formation: Formation): number {
    if (!formation.maxParticipants || formation.maxParticipants === 0) return 0;
    return Math.round((formation.currentParticipants / formation.maxParticipants) * 100);
  }

  startFormation(id: string): void {
    if (confirm('Are you sure you want to start this training?')) {
      this.formationService.startFormation(id).subscribe({
        next: () => {
          this.loadFormations();
          alert('Training started successfully!');
        },
        error: (error) => {
          console.error('Error starting training:', error);
          alert('Error starting training: ' + error.message);
        }
      });
    }
  }

  completeFormation(id: string): void {
    if (confirm('Are you sure you want to complete this training?')) {
      this.formationService.completeFormation(id).subscribe({
        next: () => {
          this.loadFormations();
          alert('Training completed successfully!');
        },
        error: (error) => {
          console.error('Error completing training:', error);
          alert('Error completing training: ' + error.message);
        }
      });
    }
  }

  cancelFormation(id: string): void {
    if (confirm('Are you sure you want to cancel this training?')) {
      this.formationService.cancelFormation(id).subscribe({
        next: () => {
          this.loadFormations();
          alert('Training cancelled successfully!');
        },
        error: (error) => {
          console.error('Error cancelling training:', error);
          alert('Error cancelling training: ' + error.message);
        }
      });
    }
  }

  deleteFormation(id: string): void {
    if (confirm('Are you sure you want to delete this training? This action cannot be undone.')) {
      this.formationService.deleteFormation(id).subscribe({
        next: () => {
          this.loadFormations();
          alert('Training deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting training:', error);
          alert('Error deleting training: ' + error.message);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDaysUntilStart(startDate: string): number {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = start.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isUpcoming(formation: Formation): boolean {
    return formation.status === 'PLANIFIED' && this.getDaysUntilStart(formation.startDate) > 0;
  }

  getParticipantStatus(formation: Formation): string {
    const percentage = this.getProgressPercentage(formation);
    if (percentage >= 90) return 'full';
    if (percentage >= 75) return 'almost-full';
    return 'available';
  }

  getSkillsArray(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
  }
}