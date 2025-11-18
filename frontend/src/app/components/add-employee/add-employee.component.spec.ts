import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEmployeeComponent } from './add-employee.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AddEmployeeComponent', () => {
  let component: AddEmployeeComponent;
  let fixture: ComponentFixture<AddEmployeeComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddEmployeeComponent,
        HttpClientTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddEmployeeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close modal', () => {
    component.openModal();
    expect(component.isOpen).toBeTrue();

    component.closeModal();
    expect(component.isOpen).toBeFalse();
  });

  it('should show error if required fields missing', () => {
    component.employee.username = '';
    component.employee.email = '';
    component.saveEmployee();

    expect(component.errorMessage)
      .toBe('Tous les champs obligatoires doivent être remplis.');
  });

  it('should call API and close modal on success', () => {
    component.employee = {
      username: 'John Doe',
      email: 'john@example.com',
      password: '12345',
      phone: '',
      status: 'Active'
    };

    const closeSpy = spyOn(component, 'closeModal');

    component.saveEmployee();

    const req = httpMock.expectOne('http://localhost:8081/api/employees/Add-employee');
    expect(req.request.method).toBe('POST');

    req.flush({ success: true });

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should show error on API failure', () => {
    component.employee = {
      username: 'John Doe',
      email: 'john@example.com',
      password: '12345',
      phone: '',
      status: 'Active'
    };

    component.saveEmployee();

    const req = httpMock.expectOne('http://localhost:8081/api/employees/Add-employee');
    req.flush('Erreur', { status: 500, statusText: 'Server Error' });
    expect(component.errorMessage).toBe('⚠️ Erreur lors de l’ajout de l’employé.');
  });
});
