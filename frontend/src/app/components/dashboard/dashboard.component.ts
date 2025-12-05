import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    Navbar],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {}
