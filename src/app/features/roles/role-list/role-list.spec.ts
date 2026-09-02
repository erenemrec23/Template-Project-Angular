import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleListComponent } from './role-list'; // Dosya yolunu projenize göre kontrol edin
import { RoleService } from '../services/role.service';
import { FilterCondition } from '../../../core/constants/filter-condition.enum';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RoleListComponent', () => {
  let component: RoleListComponent;
  let fixture: ComponentFixture<RoleListComponent>;
  let roleServiceMock: jasmine.SpyObj<RoleService>;

  beforeEach(async () => {
    // RoleService bağımlılığı için Spy nesnesi
    roleServiceMock = jasmine.createSpyObj('RoleService', [
      'getList',
      'getPassivedList',
      'deleteById',
      'setActiveById',
      'bulkDeleteByIds',
      'bulkSetActiveByIds',
      'bulkCreate',
      'exportList'
    ]);

    // BaseListDirective'in açılışta liste çekmeye çalışması durumuna karşı varsayılan mock yanıtları
    roleServiceMock.getList.and.returnValue(of({ isSuccess: true, data: { items: [], count: 0 } } as any));
    roleServiceMock.getPassivedList.and.returnValue(of({ isSuccess: true, data: { items: [], count: 0 } } as any));

    await TestBed.configureTestingModule({
      imports: [
        RoleListComponent,
        TranslateService
      ],
      providers: [
        { provide: RoleService, useValue: roleServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Alt UI component'lerini bypass etmek için
    }).compileComponents();

    fixture = TestBed.createComponent(RoleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State & Configurations', () => {
    it('should set exportFileName correctly', () => {
      expect((component as any).exportFileName).toBe('Roller_Listesi');
    });

    it('should set globalSearchFields correctly', () => {
      expect((component as any).globalSearchFields).toEqual([
        'name',
        'ModifiedByUser.FullName',
        'CreatedByUser.FullName'
      ]);
    });

    it('should initialize excelColumns correctly', () => {
      expect(component.excelColumns).toEqual([
        { headerKey: 'Title.Code', field: 'code' },
        { headerKey: 'Title.Role.Name', field: 'name' }
      ]);
    });

    it('should initialize default filter state in constructor', () => {
      const filters = component.filters(); // Directive signal kullandığı için fonksiyon gibi çağrılır

      expect(filters.globalSearch).toBe('');
      expect(filters.nameCondition).toBe(FilterCondition.Contains);
      expect(filters.sortField).toBe('revnum');
      expect(filters.sortOrder).toBe('desc');
      expect(filters.revNumCondition).toBe(FilterCondition.Equals);
    });

    it('should initialize isExcelModalOpen signal as false', () => {
      expect(component.isExcelModalOpen()).toBeFalse();
    });
  });

  describe('Single Role Actions', () => {
    it('should call onDelete when onDeleteRole is executed', () => {
      const spyOnDelete = spyOn(component, 'onDelete');
      const testId = 'role-123';

      component.onDeleteRole(testId);

      expect(spyOnDelete).toHaveBeenCalledWith(testId);
    });

    it('should call onSetActive when onSetActiveRole is executed', () => {
      const spyOnSetActive = spyOn(component, 'onSetActive');
      const testId = 'role-123';

      component.onSetActiveRole(testId);

      expect(spyOnSetActive).toHaveBeenCalledWith(testId);
    });
  });

  describe('#onBulkAction', () => {
    it('should call onBulkDelete when showPassived signal is false', () => {
      spyOn(component, 'showPassived').and.returnValue(false);
      const spyBulkDelete = spyOn(component, 'onBulkDelete');

      component.onBulkAction();

      expect(spyBulkDelete).toHaveBeenCalled();
    });

    it('should call onBulkDelete when showPassived signal is true', () => {
      spyOn(component, 'showPassived').and.returnValue(true);
      const spyBulkDelete = spyOn(component, 'onBulkDelete');

      component.onBulkAction();

      expect(spyBulkDelete).toHaveBeenCalled();
    });
  });

  describe('#bulkCreate', () => {
    const rawData = [
      { code: 'ADM', name: 'Admin', extraField: 'ignored' },
      { code: 'USR', name: 'User', extraField: 'ignored' }
    ];

    it('should map items correctly and execute onSuccess & onFinally on success response', () => {
      const onSuccessSpy = jasmine.createSpy('onSuccess');
      const onErrorSpy = jasmine.createSpy('onError');
      const onFinallySpy = jasmine.createSpy('onFinally');

      roleServiceMock.bulkCreate.and.returnValue(of({ isSuccess: true, data: ['1', '2'] } as any));

      component.bulkCreate(rawData, onSuccessSpy, onErrorSpy, onFinallySpy);

      expect(roleServiceMock.bulkCreate).toHaveBeenCalledWith({
        items: [
          {  name: 'Admin' },
          {  name: 'User' }
        ]
      });
      expect(onSuccessSpy).toHaveBeenCalled();
      expect(onErrorSpy).not.toHaveBeenCalled();
      expect(onFinallySpy).toHaveBeenCalled();
    });

    it('should execute onError & onFinally on failure response', () => {
      const onSuccessSpy = jasmine.createSpy('onSuccess');
      const onErrorSpy = jasmine.createSpy('onError');
      const onFinallySpy = jasmine.createSpy('onFinally');

      roleServiceMock.bulkCreate.and.returnValue(throwError(() => new Error('Server Error')));

      component.bulkCreate(rawData, onSuccessSpy, onErrorSpy, onFinallySpy);

      expect(onSuccessSpy).not.toHaveBeenCalled();
      expect(onErrorSpy).toHaveBeenCalled();
      expect(onFinallySpy).toHaveBeenCalled();
    });
  });
});