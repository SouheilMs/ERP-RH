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
      .toBe('All required fields must be completed.');
  });

  it('should call API and close modal on success', () => {
    component.employee = {
      username: 'John Doe',
      email: 'john@example.com',
      password: '12345',
      phone: '',
      gender: '',
      photoUrl: '',
      photoFile: null,
      hireDate: '',
      salary: null,
      position: 'SOFTWARE_DEVELOPER',
      customPosition: '',
      status: 'ACTIVE',
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
      otherBonuses: 0
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
      gender: '',
      photoUrl: '',
      photoFile: null,
      hireDate: '',
      salary: null,
      position: 'SOFTWARE_DEVELOPER',
      customPosition: '',
      status: 'ACTIVE',
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
      otherBonuses: 0
    };

    component.saveEmployee();

    const req = httpMock.expectOne('http://localhost:8081/api/employees/Add-employee');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    expect(component.errorMessage).toBe('An error occurred while adding the employee.');
  });

  it('should handle file selection', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } };

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(file);
    expect(component.employee.photoFile).toBe(file);
  });

  it('should remove photo', () => {
    component.employee.photoUrl = 'test-url';
    component.employee.photoFile = new File([''], 'test.jpg');
    component.selectedFile = new File([''], 'test.jpg');

    component.removePhoto();

    expect(component.employee.photoUrl).toBe('');
    expect(component.employee.photoFile).toBeNull();
    expect(component.selectedFile).toBeNull();
  });
});
