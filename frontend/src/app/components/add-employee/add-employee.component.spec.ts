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

  it('should have default role as ROLE_EMPLOYEE', () => {
    expect(component.employee.role).toBe('ROLE_EMPLOYEE');
  });

  it('should have available roles', () => {
    expect(component.availableRoles.length).toBe(3);
    expect(component.availableRoles[0].value).toBe('ROLE_EMPLOYEE');
    expect(component.availableRoles[1].value).toBe('ROLE_HR');
    expect(component.availableRoles[2].value).toBe('ROLE_HRMANAGER');
  });

  it('should open and close modal', () => {
    component.openModal();
    expect(component.isOpen).toBeTrue();
    expect(component.employee.role).toBe('ROLE_EMPLOYEE'); // Rôle réinitialisé

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

  it('should call API with role data and close modal on success', () => {
    component.employee = {
      username: 'John Doe',
      email: 'john@example.com',
      password: '12345',
      phone: '',
      status: '',
      role: 'ROLE_HR'
    };

    const closeSpy = spyOn(component, 'closeModal');

    component.saveEmployee();

    const req = httpMock.expectOne('http://localhost:8081/api/employees/Add-employee');
    expect(req.request.method).toBe('POST');

    // Vérifier que les données incluent le rôle
    expect(req.request.body).toEqual({
      username: 'John Doe',
      email: 'john@example.com',
      password: '12345',
      phone: '',
      status: 'Active',
      roleNames: ['ROLE_HR']
    });

    req.flush({ success: true });

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should show error on API failure', () => {
    component.employee = {
      username: 'John Doe',
      email: 'john@example.com',
      password: '12345',
      phone: '',
      status: '',
      role: 'ROLE_EMPLOYEE'
    };

    component.saveEmployee();

    const req = httpMock.expectOne('http://localhost:8081/api/employees/Add-employee');
    req.flush('Erreur', { status: 500, statusText: 'Server Error' });
    expect(component.errorMessage).toBe('⚠️ Erreur lors de l\'ajout de l\'employé.');
  });

  it('should reset role when opening modal', () => {
    // Changer le rôle
    component.employee.role = 'ROLE_HR';

    // Ouvrir la modal
    component.openModal();

    // Vérifier que le rôle est réinitialisé
    expect(component.employee.role).toBe('ROLE_EMPLOYEE');
  });
});
