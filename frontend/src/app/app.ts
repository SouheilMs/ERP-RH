import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavbarComponent} from './components/navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App {
  protected readonly title = signal('frontend');
   isAuthPage(): boolean {
    // Check if current route is authentication page
    return window.location.pathname.includes('login') || 
           window.location.pathname.includes('register') ||
           window.location.pathname.includes('auth');
  }
}
