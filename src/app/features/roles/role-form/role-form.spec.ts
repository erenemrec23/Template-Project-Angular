import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleFormComponent } from './role-form';
import { RoleService } from '../services/role.service';
import { UserService } from '../../users/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

// --- MOCK SERVICES & PIPES ---

class MockRoleService {
  getById = jasmine.createSpy('getById').and.returnValue(of({ isSuccess: true, value: { id: 'role-123', name: 'Sistem Yöneticisi', rowVersion: 'v1' } }));
  getPassivedById = jasmine.createSpy('getPassivedById').and.returnValue(of({ isSuccess: true, value: { id: 'role-123', name: 'Pasif Rol Yöneticisi', rowVersion: 'v1' } }));
  create = jasmine.createSpy('create').and.returnValue(of({ isSuccess: true }));
  update = jasmine.createSpy('update').and.returnValue(of({ isSuccess: true }));
  getAssignedPermissions = jasmine.createSpy('getAssignedPermissions').and.returnValue(of({ isSuccess: true, value: [] }));
  getAssignedPersonnelIds = jasmine.createSpy('getAssignedPersonnelIds').and.returnValue(of({ isSuccess: true, value: ['user-1', 'user-2'] }));
}

class MockUserService {
  getLookUpList = jasmine.createSpy('getLookUpList').and.returnValue(of({ isSuccess: true, value: [{ id: 'user-1', fullName: 'Ahmet Yılmaz' }] }));
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

describe('RoleFormComponent', () => {
  let component: RoleFormComponent;
  let fixture: ComponentFixture<RoleFormComponent>;
  let mockRoleService: MockRoleService;
  let mockUserService: MockUserService;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRoleService = new MockRoleService();
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
      imports: [RoleFormComponent, ReactiveFormsModule],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .overrideComponent(RoleFormComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create role form component', () => {
    expect(component).toBeTruthy();
  });

  // --- INITIALIZATION & VALIDATION ---

  describe('Form Initialization and Validation', () => {
    it('should initialize form group with default control values and minLength validation', () => {
      expect(component.formGroup).toBeDefined();
      expect(component.formGroup.get('id')?.value).toBeNull();
      
      const nameControl = component.formGroup.get('name');
      expect(nameControl?.value).toBe('');

      // minLength: 10 kuralı testi
      nameControl?.setValue('KısaRol');
      expect(nameControl?.hasError('minlength')).toBeTrue();

      nameControl?.setValue('Sistem Yöneticisi Rolü');
      expect(nameControl?.valid).toBeTrue();
    });

    it('should initialize active tab signal with general', () => {
      expect(component.activeTab()).toBe('general');
    });
  });

  // --- REDIRECT URL ---

  describe('Redirect URL', () => {
    it('should return correct redirect url for roles', () => {
      expect((component as any).getRedirectUrl()).toBe('/roles');
    });
  });

  // --- HELPER FETCH AND LABEL FUNCTIONS ---

  describe('Helper delegates and Functions', () => {
    it('should invoke roleService.getAssignedPermissions via rolePermissionFetchFn', () => {
      component.rolePermissionFetchFn('role-123');
      expect(mockRoleService.getAssignedPermissions).toHaveBeenCalledWith('role-123');
    });

    it('should invoke userService.getLookUpList via rolePersonnelFetchAllFn', () => {
      component.rolePersonnelFetchAllFn();
      expect(mockUserService.getLookUpList).toHaveBeenCalled();
    });

    it('should invoke roleService.getAssignedPersonnelIds via rolePersonnelFetchAssignedFn', () => {
      component.rolePersonnelFetchAssignedFn('role-123');
      expect(mockRoleService.getAssignedPersonnelIds).toHaveBeenCalledWith('role-123');
    });

    it('should format user full name using rolePersonnelLabelFn', () => {
      const mockUser: any = { id: 'u1', fullName: 'Caner Erkin' };
      const label = component.rolePersonnelLabelFn(mockUser);
      expect(label).toBe('Caner Erkin');
    });
  });

  // --- CALCULATED DATA CALLBACKS ---

  describe('Calculation Callbacks', () => {
    it('should update calculatedRolePermissions when onPermissionsCalculated is invoked', () => {
      const mockPermissions = [{ page: 'Users', permission: 15 }];
      component.onPermissionsCalculated(mockPermissions);

      expect((component as any).calculatedRolePermissions).toEqual(mockPermissions);
    });

    it('should update calculatedPersonnelIds when onPersonnelCalculated is invoked', () => {
      const mockUserIds = ['u-1', 'u-2'];
      component.onPersonnelCalculated(mockUserIds);

      expect((component as any).calculatedPersonnelIds).toEqual(mockUserIds);
    });
  });

  // --- SAVE OBSERVABLE (CREATE / UPDATE) ---

  describe('getSaveObservable', () => {
    it('should combine form data with calculated permissions and userIds on save', () => {
      spyOn(component as any, 'isEditMode').and.returnValue(false);

      const mockPermissions = [{ page: 'Users', value: 1 }];
      const mockUserIds = ['user-1'];

      component.onPermissionsCalculated(mockPermissions);
      component.onPersonnelCalculated(mockUserIds);

      const formData = { name: 'Sistem Yöneticisi Rolü' };
      (component as any).getSaveObservable(formData);

      const expectedCommand = {
        name: 'Sistem Yöneticisi Rolü',
        permissions: mockPermissions,
        userIds: mockUserIds
      };

      expect(mockRoleService.create).toHaveBeenCalledWith(expectedCommand);
    });

    it('should call roleService.update when in edit mode', () => {
      spyOn(component as any, 'isEditMode').and.returnValue(true);

      const formData = { id: 'role-123', name: 'Güncellenmiş Rol İsmi' };
      (component as any).getSaveObservable(formData);

      expect(mockRoleService.update).toHaveBeenCalled();
    });
  });

  // --- LOAD ENTITY DETAILS (ACTIVE / PASSIVE) ---

  describe('loadEntityDetails', () => {
    it('should call getById and patch form values when in active mode', () => {
      spyOn(component as any, 'isPassivedMode').and.returnValue(false);

      (component as any).loadEntityDetails('role-123');

      expect(mockRoleService.getById).toHaveBeenCalledWith('role-123');
      expect(component.formGroup.get('name')?.value).toBe('Sistem Yöneticisi');
    });

    it('should call getPassivedById and patch form values when in passive mode', () => {
      spyOn(component as any, 'isPassivedMode').and.returnValue(true);

      (component as any).loadEntityDetails('role-123');

      expect(mockRoleService.getPassivedById).toHaveBeenCalledWith('role-123');
      expect(component.formGroup.get('name')?.value).toBe('Pasif Rol Yöneticisi');
    });
  });
});