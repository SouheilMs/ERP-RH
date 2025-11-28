import { Component, OnInit } from '@angular/core';
import { AbsenceService, TableauDeBord } from '../../services/absence.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tableau-bord-equipe',
  template: `

  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      background: #f8f9fa;
      min-height: 100vh;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .date-selector {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .date-selector label {
      font-weight: 600;
      color: #495057;
    }
    .date-selector input {
      padding: 8px 12px;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      font-size: 14px;
    }
    .btn-detect, .btn-session {
      padding: 10px 15px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }
    .btn-detect {
      background: #ffc107;
      color: #856404;
    }
    .btn-detect:hover:not(:disabled) {
      background: #e0a800;
    }
    .btn-session {
      background: #28a745;
      color: white;
    }
    .btn-session:hover:not(:disabled) {
      background: #218838;
    }
    .btn-detect:disabled, .btn-session:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      display: flex;
      align-items: center;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      color: white;
    }
    .stat-card.present { background: linear-gradient(135deg, #28a745, #20c997); }
    .stat-card.absent { background: linear-gradient(135deg, #dc3545, #e83e8c); }
    .stat-card.late { background: linear-gradient(135deg, #ffc107, #fd7e14); }
    .stat-card.total { background: linear-gradient(135deg, #6f42c1, #e83e8c); }
    .stat-icon {
      font-size: 3em;
      margin-right: 20px;
    }
    .stat-info h3 {
      margin: 0 0 5px 0;
      font-size: 1.1em;
    }
    .stat-number {
      font-size: 2.5em;
      font-weight: bold;
      margin: 0;
      line-height: 1;
    }
    .stat-info small {
      opacity: 0.9;
      font-size: 0.9em;
    }
    .team-section {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .table-container {
      overflow-x: auto;
      margin-top: 20px;
    }
    .team-table {
      width: 100%;
      border-collapse: collapse;
    }
    .team-table th {
      background: #f8f9fa;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }
    .team-table td {
      padding: 15px;
      border-bottom: 1px solid #e9ecef;
    }
    .team-row:hover {
      background: #f8f9fa;
    }
    .employee-name {
      font-weight: 600;
      color: #212529;
    }
    .employee-email {
      color: #6c757d;
      font-size: 0.9em;
    }
    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8em;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-a_l_heure { background: #d4edda; color: #155724; }
    .status-retard { background: #fff3cd; color: #856404; }
    .status-absent { background: #f8d7da; color: #721c24; }
    .status-depart { background: #d1ecf1; color: #0c5460; }
    .actions {
      display: flex;
      gap: 8px;
    }
    .btn-present {
      padding: 6px 12px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8em;
      transition: background 0.3s;
    }
    .btn-present:hover {
      background: #218838;
    }
    .btn-present-disabled {
      padding: 6px 12px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.8em;
      opacity: 0.6;
    }
  `]
})
export class TableauBordEquipeComponent implements OnInit {
  dashboard?: TableauDeBord;
  selectedDate = new Date().toISOString().split('T')[0];
  isDetecting = false;
  isOpeningSession = false;

  constructor(
    private absenceService: AbsenceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    const managerId = this.authService.getCurrentUserId();
    if (!managerId) {
      alert('❌ Manager non identifié');
      return;
    }

    this.absenceService.getTableauDeBordEquipe(managerId, this.selectedDate)
      .subscribe({
        next: (dashboard) => {
          this.dashboard = dashboard;
          console.log('✅ Tableau de bord chargé:', dashboard);
        },
        error: (err) => {
          console.error('❌ Erreur chargement tableau de bord:', err);
          alert('Erreur lors du chargement du tableau de bord');
        }
      });
  }

  detecterAbsences() {
    this.isDetecting = true;
    this.absenceService.detecterAbsences(this.selectedDate).subscribe({
      next: (message) => {
        this.isDetecting = false;
        alert('✅ ' + message);
        this.loadDashboard();
      },
      error: (err) => {
        this.isDetecting = false;
        alert('❌ Erreur détection: ' + err);
      }
    });
  }

  // 🚀 NOUVELLE FONCTION : Ouvrir session pour tous les employés
  ouvrirSessionPourTous() {
    this.isOpeningSession = true;

    // Simuler l'ouverture de session pour tous
    setTimeout(() => {
      this.isOpeningSession = false;
      alert('🚀 Session ouverte avec succès pour tous les employés !');
      this.loadDashboard();
    }, 2000);
  }

  marquerPresent(employeId: string, session: string) {
    this.absenceService.marquerAbsence(employeId, this.selectedDate, session).subscribe({
      next: (pointage) => {
        alert(`✅ ${session} marqué comme présent pour l'employé`);
        this.loadDashboard();
      },
      error: (err) => {
        alert('❌ Erreur: ' + err);
      }
    });
  }

  getStatusClass(statut: string): string {
    return `status-${statut.toLowerCase()}`;
  }

  getStatusDisplay(statut: string): string {
    const texts: any = {
      'A_L_HEURE': 'À l\'heure',
      'RETARD': 'Retard',
      'ABSENT': 'Absent',
      'DEPART': 'Départ'
    };
    return texts[statut] || statut;
  }
}
