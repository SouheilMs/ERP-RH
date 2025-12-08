import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { LinkedinStatusComponent } from '../components/linkedin-status.component/linkedin-status.component';
import { LinkedinPostsComponent } from '../components/linkedin-posts.component/linkedin-posts.component';
import { LinkedinAuthComponent } from '../components/linkedin-auth.component/linkedin-auth.component';

@Component({
  selector: 'app-linkedin-integration',
  standalone: true, 
  imports: [
    CommonModule,
    LinkedinStatusComponent,
    LinkedinPostsComponent,
    LinkedinAuthComponent
  ],
  templateUrl: './linkedin-integration.component.html',
  styleUrls: ['./linkedin-integration.component.css']
})
export class LinkedinIntegrationComponent implements OnInit {
  activeTab = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.determineActiveTab();
  }

  determineActiveTab(): void {
    const url = this.router.url;
    if (url.includes('/auth')) {
      this.activeTab = 2;
    } else if (url.includes('/posts')) {
      this.activeTab = 1;
    } else {
      this.activeTab = 0;
    }
  }

  onTabChange(tabIndex: number): void {
    this.activeTab = tabIndex;
    switch (tabIndex) {
      case 0:
        this.router.navigate(['/linkedin/status']);
        break;
      case 1:
        this.router.navigate(['/linkedin/posts']);
        break;
      case 2:
        this.router.navigate(['/linkedin/auth']);
        break;
    }
  }
}