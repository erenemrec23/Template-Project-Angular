import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormComponent } from './user-form';
import { UserService } from '../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

// --- MOCK SERVICES & PIPES ---

class MockUserService {
  getById = jasmine.createSpy('getById').and.returnValue(of({ isSuccess: true, value: { id: '123', firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com', rowVersion: 'v1' } }));
  getPassivedById = jasmine.createSpy('getPassivedById').and.returnValue(of({ isSuccess: true, value: { id: '123', firstName: 'Mehmet', lastName: 'Demir', email: 'mehmet@example.com', rowVersion: 'v1' } }));
  create = jasmine.createSpy('create').and.returnValue(of({ isSuccess: true }));
  update = jasmine.createSpy('update').and.returnValue(of({ isSuccess: true }));
}

@Component({
  standalone: true,
  template: ''
})
class MockTranslatePipe {
  transform(value: string): string {
    return value;
  }
}

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let mockUserService: MockUserService;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockUserService = new MockUserService();
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => (key === 'id' ? null : null)
        },
        url: []
      },
      paramMap: of({ get: () => null })
    };

    await TestBed.configureTestingModule({
      imports: [UserFormComponent, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .overrideComponent(UserFormComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create user form component', () => {
    expect(component).toBeTruthy();
  });

  // --- FORM INITIALIZATION & VALIDATIONS ---

  describe('Form Initialization and Validation', () => {
    it('should initialize form group with default control values and validators', () => {
      expect(component.formGroup).toBeDefined();
      expect(component.formGroup.get('id')?.value).toBeNull();
      expect(component.formGroup.get('firstName')?.value).toBe('');
      expect(component.formGroup.get('lastName')?.value).toBe('');
      expect(component.formGroup.get('email')?.value).toBe('');
    });

    it('should validate required fields', () => {
      const form = component.formGroup;
      expect(form.valid).toBeFalse();

      form.patchValue({
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet@example.com'
      });

      expect(form.valid).toBeTrue();
    });

    it('should validate email format correctly', () => {
      const emailControl = component.formGroup.get('email');
      
      emailControl?.setValue('invalid-email-format');
      expect(emailControl?.hasError('email')).toBeTrue();

      emailControl?.setValue('valid.user@example.com');
      expect(emailControl?.hasError('email')).toBeFalse();
    });

    it('should validate minLength and maxLength for firstName and lastName', () => {
      const firstNameControl = component.formGroup.get('firstName');

      firstNameControl?.setValue('A'); // minLength: 2
      expect(firstNameControl?.hasError('minlength')).toBeTrue();

      firstNameControl?.setValue('Ahmet');
      expect(firstNameControl?.valid).toBeTrue();
    });
  });

  // --- REDIRECT URL ---

  describe('Redirect URL', () => {
    it('should return correct redirect url', () => {
      expect((component as any).getRedirectUrl()).toBe('/users');
    });
  });

  // --- SAVE OBSERVABLE (CREATE / UPDATE) ---

  describe('getSaveObservable', () => {
    it('should call userService.create when not in edit mode', () => {
      spyOn(component as any, 'isEditMode').and.returnValue(false);

      const formData = { firstName: 'Ali', lastName: 'Kaya', email: 'ali@example.com' };
      (component as any).getSaveObservable(formData);

      expect(mockUserService.create).toHaveBeenCalledWith(formData);
    });

    it('should call userService.update when in edit mode', () => {
      spyOn(component as any, 'isEditMode').and.returnValue(true);

      const formData = { id: '123', firstName: 'Ali', lastName: 'Kaya', email: 'ali@example.com' };
      (component as any).getSaveObservable(formData);

      expect(mockUserService.update).toHaveBeenCalledWith(formData);
    });
  });

  // --- LOAD ENTITY DETAILS (ACTIVE / PASSIVE) ---

  describe('loadEntityDetails', () => {
    it('should call getById and patch form values when not in passive mode', () => {
      spyOn(component as any, 'isPassivedMode').and.returnValue(false);

      (component as any).loadEntityDetails('123');

      expect(mockUserService.getById).toHaveBeenCalledWith('123');
      expect(component.formGroup.get('firstName')?.value).toBe('Ahmet');
      expect(component.formGroup.get('email')?.value).toBe('ahmet@example.com');
    });

    it('should call getPassivedById and patch form values when in passive mode', () => {
      spyOn(component as any, 'isPassivedMode').and.returnValue(true);

      (component as any).loadEntityDetails('123');

      expect(mockUserService.getPassivedById).toHaveBeenCalledWith('123');
      expect(component.formGroup.get('firstName')?.value).toBe('Mehmet');
      expect(component.formGroup.get('email')?.value).toBe('mehmet@example.com');
    });
  });
});