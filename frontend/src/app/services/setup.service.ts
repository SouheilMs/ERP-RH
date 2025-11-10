import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SetupStatus {
  isFirstTimeSetup: boolean;
  hasHRManager: boolean;
  message: string;
  defaultHRManager?: {
    email: string;
    password: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SetupService {
  private apiUrl = 'http://localhost:8081/api/setup';

  constructor(private http: HttpClient) { }

  getSetupStatus(): Observable<SetupStatus> {
    return this.http.get<SetupStatus>(`${this.apiUrl}/status`);
  }
}