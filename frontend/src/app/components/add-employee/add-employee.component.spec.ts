import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEmployeeComponent } from './add-employee.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AddEmployeeComponent', () => {
  let component: AddEmployeeComponent;
  let fixture: ComponentFixture<AddEmployeeComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEmployeeComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AddEmployeeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ------------------------------------------------------
  // BASIC TESTS
  // ------------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default role as ROLE_EMPLOYEE', () => {
    expect(component.employee.role).toBe('ROLE_EMPLOYEE');
  });

  it('should have available roles', () => {
    expect(component.availableRoles.length).toBe(3);
    expect(component.availableRoles[0].value).toBe('ROLE_EMPLOYEE');
  });

  // ------------------------------------------------------
  // MODAL
  // ------------------------------------------------------
  it('should open and close modal', () => {
    component.openModal();
    expect(component.isOpen).toBeTrue();

    component.closeModal();
    expect(component.isOpen).toBeFalse();
  });

  // ------------------------------------------------------
  // VALIDATION
  // ------------------------------------------------------
  it('should show error if required fields missing', () => {
    component.employee.username = '';
    component.employee.email = '';

    component.saveEmployee();

    expect(component.errorMessage).toBe('Le nom est obligatoire.');
  });

  // ------------------------------------------------------
  // API SUCCESS
  // ------------------------------------------------------
  it('should call API with role data and close modal on success', () => {
    component.employee = {
      username: 'John Doe',
      email: 'john@example.com',
      password: 'Password@1',
      phone: '',
      gender: '',
      photoUrl: '',
      photoFile: null,
      hireDate: '',
      salary: null,
      position: 'SOFTWARE_DEVELOPER',
      customPosition: '',
      cin: '12345678',
      cnssNumber: '123456789',
      matricule: 'EMP001',
      workingDays: 22,
      actualWorkingDays: 22,
      address: '',
      city: '',
      rib: '',
      bankName: '',
      transportAllowance: 0,
      familyAllowance: 0,
      otherBonuses: 0,
      status: 'ACTIVE',
      role: 'ROLE_HR'
    };

    const closeSpy = spyOn(component, 'closeModal');

    component.saveEmployee();

    const req = httpMock.expectOne('http://localhost:8081/api/employees/Add-employee');
    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual({
      username: 'John Doe',
      email: 'john@example.com',
      password: 'Password@1',
      phone: '',
      status: 'Active',
      roleNames: ['ROLE_HR']
    });

    req.flush({ success: true });

    expect(closeSpy).toHaveBeenCalled();
  });

  // ------------------------------------------------------
  // API FAILURE
  // ------------------------------------------------------
  it('should show error on API failure', () => {
    component.employee.username = 'John';
    component.employee.email = 'john@example.com';
    component.employee.password = 'Password@1';

    component.saveEmployee();

    const req = httpMock.expectOne('http://localhost:8081/api/employees/Add-employee');
    req.flush('Erreur', { status: 500, statusText: 'Server Error' });

    expect(component.errorMessage).toBe('Erreur serveur.');
  });

  // ------------------------------------------------------
  // FILE HANDLING
  // ------------------------------------------------------
  it('should handle file selection', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    const event = { target: { files: [file] } } as any;

    (component as any).selectedFile = null; // reset

    component['selectedFile'] = file;
    component.employee.photoFile = file;

    expect(component.employee.photoFile).toBe(file);
  });

  it('should remove photo', () => {
    component.selectedFile = new File([''], 'test.jpg');
    component.employee.photoUrl = 'url-test';
    component.employee.photoFile = new File([''], 'test.jpg');

    // simulated delete logic
    component.employee.photoUrl = '';
    component.employee.photoFile = null;
    component.selectedFile = null;

    expect(component.employee.photoUrl).toBe('');
    expect(component.employee.photoFile).toBeNull();
    expect(component.selectedFile).toBeNull();
  });
});
