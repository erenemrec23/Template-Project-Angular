import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list';
import { UserService } from '../services/user.service';
import { UserListItemDto } from '../models/user-list-item.model';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { of } from 'rxjs';

// --- MOCK SERVICES & PIPES ---

class MockUserService {
  getList = jasmine.createSpy('getList').and.returnValue(of({ items: [], totalCount: 0 }));
  delete = jasmine.createSpy('delete').and.returnValue(of({ isSuccess: true }));
  setActive = jasmine.createSpy('setActive').and.returnValue(of({ isSuccess: true }));
  bulkSetActive = jasmine.createSpy('bulkSetActive').and.returnValue(of({ isSuccess: true }));
  bulkSetPassive = jasmine.createSpy('bulkSetPassive').and.returnValue(of({ isSuccess: true }));
  bulkDelete = jasmine.createSpy('bulkDelete').and.returnValue(of({ isSuccess: true }));
  bulkCreate = jasmine.createSpy('bulkCreate').and.returnValue(of({ isSuccess: true }));
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

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: MockUserService;

  beforeEach(async () => {
    mockUserService = new MockUserService();

    const mockActivatedRoute = {
      snapshot: { queryParamMap: { get: () => null, has: () => false, keys: [] } },
      queryParamMap: of({ get: () => null, has: () => false, keys: [] })
    };

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .overrideComponent(UserListComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create user list component', () => {
    expect(component).toBeTruthy();
  });

  // --- INITIAL CONFIGURATIONS ---

  describe('Initial Configurations', () => {
    it('should set initial export file name correctly', () => {
      expect((component as any).exportFileName).toBe('Kullanicilar_Listesi');
    });

    it('should initialize excel columns config correctly', () => {
      expect(component.excelColumns.length).toBe(3);
      expect(component.excelColumns[0].field).toBe('firstName');
    });

    it('should initialize global search fields correctly', () => {
      expect((component as any).globalSearchFields).toContain('email');
      expect((component as any).globalSearchFields).toContain('firstName');
    });
  });

  // --- ACTIONS AND DELEGATIONS ---

  describe('Action Delegations', () => {
    it('should trigger onDelete when onDeleteUser is called', () => {
      spyOn(component, 'onDelete');
      component.onDeleteUser('user-123');
      expect(component.onDelete).toHaveBeenCalledWith('user-123');
    });

    it('should trigger onSetActive when onSetActiveUser is called', () => {
      spyOn(component, 'onSetActive');
      component.onSetActiveUser('user-123');
      expect(component.onSetActive).toHaveBeenCalledWith('user-123');
    });

    it('should trigger onBulkSetActive when onBulkSetActiveRole is called', () => {
      spyOn(component, 'onBulkSetActive');
      component.onBulkSetActiveRole();
      expect(component.onBulkSetActive).toHaveBeenCalled();
    });

    it('should trigger onBulkSetPassive when onBulkSetPassiveRole is called', () => {
      spyOn(component, 'onBulkSetPassive');
      component.onBulkSetPassiveRole();
      expect(component.onBulkSetPassive).toHaveBeenCalled();
    });

    it('should trigger onBulkDelete when onBulkAction is called', () => {
      spyOn(component, 'onBulkDelete');
      component.onBulkAction();
      expect(component.onBulkDelete).toHaveBeenCalled();
    });
  });

  // --- BULK CREATE ---

  describe('bulkCreate', () => {
    it('should execute bulkCreateInternal with mapped payload and callbacks', () => {
      const mockData = [
        { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' }
      ];

      const onSuccess = jasmine.createSpy('onSuccess');
      const onError = jasmine.createSpy('onError');
      const onFinally = jasmine.createSpy('onFinally');

      spyOn<any>(component, 'bulkCreateInternal').and.callFake(
        (_data: any, mapItem: Function, mapCommand: Function, successCb: Function, _errorCb: Function, finallyCb: Function) => {
          const mappedItems = _data.map(mapItem);
          const command = mapCommand(mappedItems);
          expect(command).toEqual({
            items: [{ firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' }]
          });
          successCb();
          finallyCb();
        }
      );

      component.bulkCreate(mockData, onSuccess, onError, onFinally);

      expect((component as any).bulkCreateInternal).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      expect(onFinally).toHaveBeenCalled();
    });
  });

  // --- EXTRA ROW ACTIONS ---

  describe('rowExtraActions', () => {
    it('should return authorization route action for given user row', () => {
      const mockUserRow: UserListItemDto = {
        id: 'user-guid-123',
        firstName: 'Mehmet',
        lastName: 'Demir',
        fullName: 'Mehmet Demir',
        email: 'mehmet@example.com',
        revNum: 1,
        modifiedUserFullName: '',
        createdUserFullName: '',
        modifiedDateTime: null,
        createdDateTime: new Date().toISOString()
      };

      const actions = component.rowExtraActions(mockUserRow);

      expect(actions.length).toBe(1);
      expect(actions[0].label).toBe('Label.ActionAuthorize');
      expect(actions[0].icon).toBe('bi-shield-lock');
      expect(actions[0].routerLink).toEqual(['/user-permisson/form', 'user-guid-123']);
    });
  });
});