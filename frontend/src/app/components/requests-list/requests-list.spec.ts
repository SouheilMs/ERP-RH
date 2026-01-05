import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsListComponent } from './requests-list';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RequestsListComponent', () => {
  let component: RequestsListComponent;
  let fixture: ComponentFixture<RequestsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestsListComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
