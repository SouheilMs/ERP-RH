import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ResetPasswordComponent } from './components/ResetPassword/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeDetailComponent } from './components/employee-detail/employee-detail.component';
import { RoleListComponent } from './components/role-list/role-list';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { PayslipHistoryComponent } from './components/payslip-history/payslip-history.component';
import { JobListComponent } from './components/job-list.component/job-list.component';
import { JobFormComponent } from './components/job-form.component/job-form.component'; // ✅ AJOUTER CET IMPORT
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ✅ Route par défaut vers le login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Routes publiques (sans layout)
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // ✅ Routes protégées (avec layout et guard)
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/:id', component: EmployeeDetailComponent },
      { path: 'employees/:id/payslips', component: PayslipHistoryComponent },
      { path: 'roles', component: RoleListComponent },
      { path: 'jobs', component: JobListComponent },
      { path: 'jobs/new', component: JobFormComponent }, // ✅ NOUVELLE OFFRE
      { path: 'jobs/:id/edit', component: JobFormComponent }, // ✅ MODIFICATION OFFRE
      { path: 'my-profile', component: EmployeeDetailComponent, data: { isMyProfile: true } },
    ]
  },

  // ✅ Redirection pour les routes inconnues vers le login
  { path: '**', redirectTo: '/login' }
];