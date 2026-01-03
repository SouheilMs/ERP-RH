import { Component, OnDestroy, OnInit } from '@angular/core';
import { LinkedInApiService } from '../../services/linkedin-api.service';
import { LinkedInIntegrationStatus } from '../../models/linkedin.models';
import { MessageService } from 'primeng/api';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToastModule } from 'primeng/toast';
import { ChartModule } from 'primeng/chart';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-linkedin-status',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // PrimeNG modules disponibles
    ProgressSpinnerModule,
    ButtonModule,
    TagModule,
    CardModule,
    ChartModule,
    ToastModule
  ],
  templateUrl: './linkedin-status.component.html',
  styleUrls: ['./linkedin-status.component.css'],
  providers: [DatePipe, MessageService]
})
export class LinkedinStatusComponent implements OnInit, OnDestroy {
  integrationStatus: LinkedInIntegrationStatus | null = null;
  isLoading = false;
  syncLoading = false;
  refreshLoading = false;
  private statusRefreshSubscription: Subscription | null = null;

  // Graphique
  chartData: any;
  chartOptions: any;

  // Méthode getStatusColor corrigée
getStatusColor(): any {
  if (!this.integrationStatus) return 'secondary';

  switch (this.integrationStatus.status) {
    case 'ACTIVE': return 'success';
    case 'EXPIRED': return 'warning';
    case 'ERROR': return 'danger';
    case 'SYNCING': return 'info';
    default: return 'secondary';
  }
}

  // Méthode formatDate
  formatDate(date: any): string {
    if (!date) return 'N/A';
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  // Méthode safeConnected pour éviter les erreurs
  get safeConnected(): boolean {
    return this.integrationStatus?.connected || false;
  }

  constructor(
    private linkedInService: LinkedInApiService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadIntegrationStatus();
    this.setupAutoRefresh();
    this.initChart();
  }

  ngOnDestroy(): void {
    if (this.statusRefreshSubscription) {
      this.statusRefreshSubscription.unsubscribe();
    }
  }

  loadIntegrationStatus(): void {
    this.isLoading = true;
    this.linkedInService.getIntegrationStatus().subscribe({
      next: (status) => {
        this.integrationStatus = status;
        this.isLoading = false;
        this.updateChartData();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement du statut: ' + error.message
        });
        this.isLoading = false;
      }
    });
  }

  setupAutoRefresh(): void {
    // Rafraîchir automatiquement toutes les 30 secondes
    this.statusRefreshSubscription = interval(30000).pipe(
      switchMap(() => this.linkedInService.getIntegrationStatus())
    ).subscribe(status => {
      this.integrationStatus = status;
      this.updateChartData();
    });
  }

  initChart(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        r: {
          grid: {
            color: surfaceBorder
          },
          pointLabels: {
            color: textColorSecondary
          }
        }
      }
    };
  }

  updateChartData(): void {
    if (!this.integrationStatus) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const primaryColor = documentStyle.getPropertyValue('--primary-color');
    const successColor = documentStyle.getPropertyValue('--green-500');
    const warningColor = documentStyle.getPropertyValue('--yellow-500');
    const dangerColor = documentStyle.getPropertyValue('--red-500');

    this.chartData = {
      labels: ['Connexion', 'Token valide', 'Dernière sync', 'Publications', 'Engagement'],
      datasets: [
        {
          label: 'Statut LinkedIn',
          data: [
            this.integrationStatus.connected ? 100 : 0,
            this.isTokenValid() ? 100 : 0,
            this.getSyncScore(),
            this.integrationStatus.statistics?.['posts_count'] || 0,
            this.integrationStatus.statistics?.['avg_engagement'] || 0
          ],
          backgroundColor: 'rgba(0, 119, 181, 0.2)',
          borderColor: primaryColor,
          pointBackgroundColor: [
            this.integrationStatus.connected ? successColor : dangerColor,
            this.isTokenValid() ? successColor : warningColor,
            successColor,
            primaryColor,
            successColor
          ],
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: primaryColor
        }
      ]
    };
  }

  getSyncScore(): number {
    if (!this.integrationStatus?.lastSync) return 0;
    const hoursSinceLastSync = (new Date().getTime() - new Date(this.integrationStatus.lastSync).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSync < 1) return 100;
    if (hoursSinceLastSync < 24) return 75;
    if (hoursSinceLastSync < 72) return 50;
    return 25;
  }

  isTokenValid(): boolean {
    if (!this.integrationStatus?.expiresAt) return false;
    return new Date(this.integrationStatus.expiresAt) > new Date();
  }

  getTokenExpiryDays(): number {
    if (!this.integrationStatus?.expiresAt) return 0;
    const diff = new Date(this.integrationStatus.expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  refreshToken(): void {
    if (!this.integrationStatus) return;

    this.refreshLoading = true;
    // Appeler l'API pour rafraîchir le token
    // this.linkedInService.refreshToken(refreshToken).subscribe({
    //   next: () => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Succès',
    //       detail: 'Token rafraîchi avec succès'
    //     });
    //     this.loadIntegrationStatus();
    //   },
    //   error: (error) => {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Erreur',
    //       detail: 'Erreur lors du rafraîchissement: ' + error.message
    //     });
    //     this.refreshLoading = false;
    //   }
    // });
  }

  syncNow(): void {
    this.syncLoading = true;
    this.linkedInService.syncJobApplications('current').subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Synchronisation terminée'
        });
        this.loadIntegrationStatus();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la synchronisation: ' + error.message
        });
        this.syncLoading = false;
      }
    });
  }

  reconnect(): void {
    window.location.href = '/linkedin/auth';
  }

  disconnect(): void {
    // Implémenter la déconnexion
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Fonctionnalité de déconnexion à implémenter'
    });
  }

  getStatusIcon(): string {
    if (!this.integrationStatus) return 'pi pi-question-circle';

    switch (this.integrationStatus.status) {
      case 'ACTIVE': return 'pi pi-check-circle';
      case 'EXPIRED': return 'pi pi-exclamation-circle';
      case 'ERROR': return 'pi pi-times-circle';
      case 'SYNCING': return 'pi pi-sync';
      default: return 'pi pi-question-circle';
    }
  }


}
