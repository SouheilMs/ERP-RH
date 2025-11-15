import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ResetPasswordComponent } from './components/ResetPassword/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeDetailComponent } from './components/employee-detail/employee-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Dashboard layout avec children
  {
    path: 'employees',
    component: DashboardComponent,
    children: [
      { path: '', component: EmployeeListComponent },       // Liste des employés
      { path: ':id', component: EmployeeDetailComponent }   // Détail d’un employé (toujours en dernier)
    ]
  },

  { path: '**', redirectTo: '/login' }  // Redirection par défaut
];
