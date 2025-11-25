import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ResetPasswordComponent } from './components/ResetPassword/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeDetailComponent } from './components/employee-detail/employee-detail.component';
import { RoleListComponent } from './components/role-list/role-list';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {LeaveBalanceComponent} from './components/leave-balance/leave-balance.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'mes-conges', component: LeaveBalanceComponent },

  // Dashboard layout avec children
  {
    path: 'employees',
    component: DashboardComponent,
    children: [
      { path: '', component: EmployeeListComponent },       // Liste des employés
      { path: ':id', component: EmployeeDetailComponent },  // Détail d'un employé
      { path: 'roles', component: RoleListComponent },      // Liste des rôles
      { path: 'mes-conges', component: LeaveBalanceComponent }
    ]
  },

  // Route directe pour les rôles (si nécessaire)
  { path: 'roles', component: RoleListComponent },


];
