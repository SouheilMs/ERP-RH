import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedinStatusComponent } from './linkedin-status.component';

describe('LinkedinStatusComponent', () => {
  let component: LinkedinStatusComponent;
  let fixture: ComponentFixture<LinkedinStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkedinStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkedinStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
