import { Component, OnInit } from '@angular/core';
import { JobOfferService } from '../../services/job-offer.service';
import { LinkedInApiService } from '../../services/linkedin-api.service';
import { JobOffer } from '../../models/job-offer.models';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-linkedin-posts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    // PrimeNG modules disponibles
    ButtonModule,
    TableModule,
    DialogModule,
    TooltipModule,
    TagModule,
    ProgressSpinnerModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './linkedin-posts.component.html',
  styleUrls: ['./linkedin-posts.component.css'],
  providers: [DatePipe, SlicePipe, MessageService, ConfirmationService]
})
export class LinkedinPostsComponent implements OnInit {
  jobOffers: any[] = []; // Utiliser any pour éviter les conflits de types
  publishedPosts: any[] = [];
  selectedJobOffers: any[] = [];
  isLoading = false;
  showPublishDialog = false;
  selectedJobOffer: any = null;

  // Filtres
  statusFilter: string = 'all';
  departmentFilter: string = '';
  locationFilter: string = '';

  // Propriétés pour le dialog
  publishImmediately = true;
  scheduleForLater = false;
  scheduleDate?: Date;

   statusOptions = [
    { label: 'Tous les statuts', value: 'all' },
    { label: 'Brouillon', value: 'DRAFT' },
    { label: 'Publié', value: 'PUBLISHED' },
    { label: 'Clôturé', value: 'CLOSED' }
  ];

constructor(
    private jobOfferService: JobOfferService,
    private linkedInService: LinkedInApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private slicePipe: SlicePipe
  ) {}

  ngOnInit(): void {
    this.loadJobOffers();
    this.loadPublishedPosts();
  }

  loadJobOffers(): void {
    this.isLoading = true;
    this.jobOfferService.getActiveJobOffers().subscribe({
      next: (offers: any[]) => {
        this.jobOffers = offers;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des offres: ' + error.message
        });
        this.isLoading = false;
      }
    });
  }

  loadPublishedPosts(): void {
    this.linkedInService.getPublishedPosts().subscribe({
      next: (posts) => {
        this.publishedPosts = posts;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des posts:', error);
      }
    });
  }
    clearFilters(): void {
    this.statusFilter = 'all';
    this.departmentFilter = '';
    this.locationFilter = '';
  }

  get filteredJobOffers(): JobOffer[] {
    return this.jobOffers.filter(offer => {
      // Filtre par statut
      if (this.statusFilter !== 'all' && offer.status !== this.statusFilter) {
        return false;
      }

      // Filtre par département
      if (this.departmentFilter && !offer.department.toLowerCase().includes(this.departmentFilter.toLowerCase())) {
        return false;
      }

      // Filtre par localisation
      if (this.locationFilter && !offer.location.toLowerCase().includes(this.locationFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  openPublishDialog(jobOffer: JobOffer): void {
    this.selectedJobOffer = jobOffer;
    this.showPublishDialog = true;
  }

  publishToLinkedIn(jobOffer: JobOffer): void {
    this.isLoading = true;
    this.linkedInService.publishJobOffer(jobOffer.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Offre publiée sur LinkedIn avec succès!'
          });
          
          // Mettre à jour l'offre localement
          const index = this.jobOffers.findIndex(o => o.id === jobOffer.id);
          if (index !== -1) {
            this.jobOffers[index].linkedInPostId = response.id;
            this.jobOffers[index].externalPlatforms.push('LINKEDIN');
          }
          
          // Recharger les posts publiés
          this.loadPublishedPosts();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la publication: ' + response.message
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la publication: ' + error.message
        });
      },
      complete: () => {
        this.isLoading = false;
        this.showPublishDialog = false;
        this.selectedJobOffer = null;
      }
    });
  }

  unpublishFromLinkedIn(jobOffer: JobOffer): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer cette offre de LinkedIn?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Non, annuler',
      accept: () => {
        this.isLoading = true;
        this.jobOfferService.unpublishFromLinkedIn(jobOffer.id).subscribe({
          next: (updatedOffer) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Offre supprimée de LinkedIn avec succès!'
            });
            
            // Mettre à jour l'offre localement
            const index = this.jobOffers.findIndex(o => o.id === jobOffer.id);
            if (index !== -1) {
              this.jobOffers[index] = updatedOffer;
            }
            
            // Recharger les posts publiés
            this.loadPublishedPosts();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la suppression: ' + error.message
            });
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  getPostStatus(jobOffer: JobOffer): string {
    if (jobOffer.linkedInPostId) {
      return 'published';
    }
    return 'not-published';
  }

  getPlatformStatus(jobOffer: JobOffer): any {
    return {
      linkedin: jobOffer.externalPlatforms?.includes('LINKEDIN') || false,
      indeed: jobOffer.externalPlatforms?.includes('INDEED') || false
    };
  }

  viewPostOnLinkedIn(postId: string): void {
    window.open(`https://www.linkedin.com/feed/update/${postId}`, '_blank');
  }

  publishSelected(): void {
    if (this.selectedJobOffers.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Avertissement',
        detail: 'Veuillez sélectionner au moins une offre à publier'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Publier ${this.selectedJobOffers.length} offre(s) sur LinkedIn?`,
      header: 'Confirmation de publication',
      icon: 'pi pi-external-link',
      accept: () => {
        this.selectedJobOffers.forEach(jobOffer => {
          this.publishToLinkedIn(jobOffer);
        });
        this.selectedJobOffers = [];
      }
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'DRAFT': return 'secondary';
      case 'PUBLISHED': return 'success';
      case 'CLOSED': return 'danger';
      case 'ARCHIVED': return 'warning';
      default: return 'secondary';
    }
  }

   // Méthode formatDate pour éviter d'utiliser le pipe dans le template
  formatDate(date: any): string {
    if (!date) return 'N/A';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  // Méthode slice pour éviter d'utiliser le pipe dans le template
  sliceText(text: string, start: number, end: number): string {
    if (!text) return '';
    return this.slicePipe.transform(text, start, end) || '';
  }
  onImmediateChange(event: any): void {
  if (event.target.checked) {
    this.scheduleForLater = false;
  }
}
}