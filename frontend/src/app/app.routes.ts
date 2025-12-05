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
import { JobFormComponent } from './components/job-form.component/job-form.component';
import { FormationListComponent } from './components/formation-list.component/formation-list.component';
import { FormationFormComponent } from './components/formation-form.component/formation-form.component';
import {LeaveBalanceComponent} from './components/leave-balance/leave-balance.component';

import { authGuard } from './guards/auth.guard';
import { formationGuard } from './guards/formation.guard';
import { jobGuard } from './guards/job.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Routes publiques
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'conges', component: LeaveBalanceComponent },

  // Protected routes (with authentication)
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      // Dashboard
      { path: 'dashboard', redirectTo: 'employees', pathMatch: 'full' },

      // Employee management
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/:id', component: EmployeeDetailComponent },
      { path: 'employees/:id/payslips', component: PayslipHistoryComponent },
      { path: 'roles', component: RoleListComponent },

      // ✅ CORRECTION : Routes Job avec ordre correct
      {
        path: 'jobs/new',
        component: JobFormComponent,
        canActivate: [jobGuard]
      },
      {
        path: 'jobs/:id/edit',
        component: JobFormComponent,
        canActivate: [jobGuard]
      },
      {
        path: 'jobs',
        component: JobListComponent,
        canActivate: [jobGuard]
      },

      { path: 'my-profile', component: EmployeeDetailComponent, data: { isMyProfile: true } },

      // Routes Formations
      {
        path: 'formations',
        component: FormationListComponent,
        canActivate: [formationGuard]
      },
      {
        path: 'formations/new',
        component: FormationFormComponent,
        canActivate: [formationGuard]
      },
      {
        path: 'formations/edit/:id',
        component: FormationFormComponent,
        canActivate: [formationGuard]
      },

      { path: '', redirectTo: 'employees', pathMatch: 'full' }
    ]
  },

  // Default redirects
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
