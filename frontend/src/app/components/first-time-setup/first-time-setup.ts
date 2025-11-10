import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SetupService } from '../../services/setup.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-first-time-setup',
  imports: [],
  templateUrl: './first-time-setup.html',
  styleUrl: './first-time-setup.css'
})
export class FirstTimeSetup implements CanActivate {

  constructor(
    private setupService: SetupService,
    private router: Router
  ) {}

  canActivate(): any {
    return this.setupService.getSetupStatus().pipe(
      map(status => {
        if (status.isFirstTimeSetup) {
          // Rediriger vers la page de setup
          this.router.navigate(['/first-time-setup']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        // En cas d'erreur, permettre l'accès
        return of(true);
      })
    );
  }
}
