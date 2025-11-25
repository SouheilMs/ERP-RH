// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ResetPasswordComponent } from './components/ResetPassword/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeDetailComponent } from './components/employee-detail/employee-detail.component';
import { RoleListComponent } from './components/role-list/role-list';
import { PayslipHistoryComponent } from './components/payslip-history/payslip-history.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AuthGuard } from './guards/auth.guard';
import { hrRoleGuard } from './guards/role.guard';

export const routes: Routes = [
  // Routes publiques (sans layout)
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuard] // Empêche l'accès à login si déjà connecté
  },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Routes protégées (avec layout DashboardComponent)
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      // Route par défaut qui redirige selon le rôle
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'redirect'
      },
      // Route de redirection temporaire
      {
        path: 'redirect',
        canActivate: [AuthGuard],
        component: LoginComponent, // Composant temporaire, sera redirigé immédiatement
      },
      // MON PROFIL - Pour les employés
      {
        path: 'my-profile',
        component: EmployeeDetailComponent,
        data: { isMyProfile: true }
      },
      // Dashboard accessible à tous
      {
        path: 'dashboard',
        component: EmployeeListComponent
      },
      // Liste des employés - réservée aux RH
      {
        path: 'employees',
        component: EmployeeListComponent,
        canActivate: [hrRoleGuard]
      },
      // Détail d'un employé
      {
        path: 'employees/:id',
        component: EmployeeDetailComponent,
        data: { isMyProfile: false }
      },
      // Fiches de paie - réservées aux RH
      {
        path: 'employees/:id/payslips',
        component: PayslipHistoryComponent,
        canActivate: [AuthGuard]
      },
      // Rôles - réservés aux RH
      {
        path: 'roles',
        component: RoleListComponent,
        canActivate: [hrRoleGuard]
      }
    ]
  },

  // Redirections globales
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
