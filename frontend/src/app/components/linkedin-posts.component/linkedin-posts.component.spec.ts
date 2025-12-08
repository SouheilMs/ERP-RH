import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedinPostsComponent } from './linkedin-posts.component';

describe('LinkedinPostsComponent', () => {
  let component: LinkedinPostsComponent;
  let fixture: ComponentFixture<LinkedinPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkedinPostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkedinPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
