import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinkedinIntegrationComponent } from './linkedin-integration.component/linkedin-integration.component';

const routes: Routes = [
  {
    path: '',
    component: LinkedinIntegrationComponent,
    children: [
      {
        path: 'status',
        loadComponent: () => import('./components/linkedin-status.component/linkedin-status.component')
          .then(m => m.LinkedinStatusComponent)
      },
      {
        path: 'posts',
        loadComponent: () => import('./components/linkedin-posts.component/linkedin-posts.component')
          .then(m => m.LinkedinPostsComponent)
      },
      {
        path: 'auth',
        loadComponent: () => import('./components/linkedin-auth.component/linkedin-auth.component')
          .then(m => m.LinkedinAuthComponent)
      },
      {
        path: '',
        redirectTo: 'status',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkedinIntegrationRoutingModule { }