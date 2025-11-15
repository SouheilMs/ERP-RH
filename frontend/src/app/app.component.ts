import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoleListComponent } from './components/role-list/role-list';

@Component({
  selector: 'app-root',
  standalone: true,
 imports: [CommonModule, RouterOutlet, RoleListComponent],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {}
