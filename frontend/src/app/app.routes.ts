import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeDetailComponent } from './components/employee-detail/employee-detail.component';
import { RoleListComponent } from './components/role-list/role-list';
import { PayslipHistoryComponent } from './components/payslip-history/payslip-history.component';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {SubmitCongeComponent} from './components/submit-conge/submit-conge';

export const routes: Routes = [
  // Routes publiques (sans layout)
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'conge', component: SubmitCongeComponent},

 // Routes protégées (avec layout)
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'dashboard', redirectTo: 'employees', pathMatch: 'full' },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/:id', component: EmployeeDetailComponent },
      { path: 'roles', component: RoleListComponent },
      
      // Redirection par défaut pour les routes protégées
      { path: '', redirectTo: 'employees', pathMatch: 'full' }
    ]
  },

  // Redirection par défaut
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
