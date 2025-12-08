import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Routes
import { LinkedinIntegrationRoutingModule } from './linkedin-integration-routing.module';

@NgModule({
  imports: [
    CommonModule,
    LinkedinIntegrationRoutingModule
  ]
})
export class LinkedinIntegrationModule { }