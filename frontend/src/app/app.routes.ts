import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeDetailComponent } from './components/employee-detail/employee-detail.component';
import { RoleListComponent } from './components/role-list/role-list';
import { PayslipHistoryComponent } from './components/payslip-history/payslip-history.component';
import { AuthGuard } from './services/guards/auth-guard';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { SubmitCongeComponent } from './components/submit-conge/submit-conge';
import { JobListComponent } from './components/job-list.component/job-list.component';
import { JobFormComponent } from './components/job-form.component/job-form.component';
import { FormationListComponent } from './components/formation-list.component/formation-list.component';
import { FormationFormComponent } from './components/formation-form.component/formation-form.component';



export const routes: Routes = [
  // Public routes (no authentication required)
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'conge', component: SubmitCongeComponent},

  // Protected routes (with authentication)
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      { path: 'dashboard', redirectTo: 'employees', pathMatch: 'full' },

      // Employee management
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/:id', component: EmployeeDetailComponent },
      { path: 'employees/:id/payslip-history', component: PayslipHistoryComponent },

      { path: 'roles', component: RoleListComponent },

     // Job offers management
      { path: 'jobs', component: JobListComponent },
      { path: 'jobs/new', component: JobFormComponent },
      { path: 'jobs/edit/:id', component: JobFormComponent },

      // Formations management
      { path: 'formations', component: FormationListComponent },
      { path: 'formations/new', component: FormationFormComponent },
      { path: 'formations/edit/:id', component: FormationFormComponent },

      // Default protected route
      { path: '', redirectTo: 'employees', pathMatch: 'full' }
    ]
  },

  // Default redirects
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
