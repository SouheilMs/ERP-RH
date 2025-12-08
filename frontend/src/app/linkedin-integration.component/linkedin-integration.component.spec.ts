import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedinIntegrationComponent } from './linkedin-integration.component';

describe('LinkedinIntegrationComponent', () => {
  let component: LinkedinIntegrationComponent;
  let fixture: ComponentFixture<LinkedinIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkedinIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkedinIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
