import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableHeaderFilterComponent } from './table-header-filter';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { PagePermissionService } from '../../../services/page-permission.service';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';

// --- MOCK COMPONENTS & PIPES ---

// SharedButtonComponent bağımlılığını taklit ediyoruz
@Component({
  selector: 'app-shared-button',
  standalone: true,
  template: '<button><ng-content></ng-content></button>'
})
class MockSharedButtonComponent {
  @Input() variant: string = 'primary';
  @Input() disabled: boolean = false;
  @Input() icon: string = '';
}

// ngx-translate TranslatePipe taklidi
@Component({
  standalone: true,
  template: ''
})
class MockTranslatePipe {
  transform(value: string): string {
    return value;
  }
}

describe('TableHeaderFilterComponent', () => {
  let component: TableHeaderFilterComponent;
  let fixture: ComponentFixture<TableHeaderFilterComponent>;

  let mockPagePermissionService: jasmine.SpyObj<PagePermissionService>;
  let queryParamMapSubject: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    queryParamMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({}));

    mockPagePermissionService = jasmine.createSpyObj('PagePermissionService', [
      'canDelete',
      'canSetActive',
      'canSetPassive',
      'canViewPassive'
    ]);

    // Varsayılan yetkilendirme yanıtları
    mockPagePermissionService.canDelete.and.returnValue(true);
    mockPagePermissionService.canSetActive.and.returnValue(true);
    mockPagePermissionService.canSetPassive.and.returnValue(true);
    mockPagePermissionService.canViewPassive.and.returnValue(true);

    const mockActivatedRoute = {
      snapshot: { queryParamMap: convertToParamMap({}) },
      queryParamMap: queryParamMapSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [TableHeaderFilterComponent],
      providers: [
        { provide: PagePermissionService, useValue: mockPagePermissionService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .overrideComponent(TableHeaderFilterComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableHeaderFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // --- 1. COMPUTED PERMISSION TESTS ---

  describe('Permissions computed signals', () => {
    it('should delegate canBulkDelete calculation to PagePermissionService', () => {
      expect(mockPagePermissionService.canDelete).toHaveBeenCalledWith(
        jasmine.any(Object),
        component.showBulkDelete()
      );
      expect(component.canBulkDelete()).toBeTrue();
    });

    it('should delegate canBulkSetActive calculation to PagePermissionService', () => {
      expect(mockPagePermissionService.canSetActive).toHaveBeenCalledWith(
        jasmine.any(Object),
        component.showBulkSetActive()
      );
      expect(component.canBulkSetActive()).toBeTrue();
    });

    it('should delegate canBulkSetPassive calculation to PagePermissionService', () => {
      expect(mockPagePermissionService.canSetPassive).toHaveBeenCalledWith(
        jasmine.any(Object),
        component.showBulkSetPassive()
      );
      expect(component.canBulkSetPassive()).toBeTrue();
    });

    it('should delegate canViewPassive calculation to PagePermissionService', () => {
      expect(mockPagePermissionService.canViewPassive).toHaveBeenCalledWith(
        jasmine.any(Object),
        component.showPassivedFilter()
      );
      expect(component.canViewPassive()).toBeTrue();
    });
  });

  // --- 2. QUERY PARAMS & HAS ACTIVE FILTERS TESTS ---

  describe('hasActiveFilters computed signal', () => {
    it('should return false when no filter query parameters are present', () => {
      expect(component.hasActiveFilters()).toBeFalse();
    });

    it('should return true when filter related query params exist', () => {
      queryParamMapSubject.next(convertToParamMap({ nameValue: 'john' }));
      fixture.detectChanges();

      expect(component.hasActiveFilters()).toBeTrue();
    });

    it('should return true when pagination or sorting query params exist', () => {
      queryParamMapSubject.next(convertToParamMap({ sortField: 'name', page: '1' }));
      fixture.detectChanges();

      expect(component.hasActiveFilters()).toBeTrue();
    });

    it('should return false when query params do not match filter rules', () => {
      queryParamMapSubject.next(convertToParamMap({ otherParam: '123' }));
      fixture.detectChanges();

      expect(component.hasActiveFilters()).toBeFalse();
    });
  });

  // --- 3. OUTPUT EVENT EMITTER TESTS ---

  describe('Output event handlers', () => {
    it('should emit clearFilters when onClearClick is called', () => {
      spyOn(component.clearFilters, 'emit');
      component.onClearClick();
      expect(component.clearFilters.emit).toHaveBeenCalled();
    });

    it('should emit searchChange when onSearchChange is called', () => {
      spyOn(component.searchChange, 'emit');
      component.onSearchChange();
      expect(component.searchChange.emit).toHaveBeenCalled();
    });

    it('should emit bulkDelete when onBulkDeleteClick is called', () => {
      spyOn(component.bulkDelete, 'emit');
      component.onBulkDeleteClick();
      expect(component.bulkDelete.emit).toHaveBeenCalled();
    });

    it('should emit bulkSetPassive when onBulkSetPassiveClick is called', () => {
      spyOn(component.bulkSetPassive, 'emit');
      component.onBulkSetPassiveClick();
      expect(component.bulkSetPassive.emit).toHaveBeenCalled();
    });

    it('should emit bulkSetActive when onBulkSetActiveClick is called', () => {
      spyOn(component.bulkSetActive, 'emit');
      component.onBulkSetActiveClick();
      expect(component.bulkSetActive.emit).toHaveBeenCalled();
    });

    it('should emit toggleSelectAll when onToggleSelectAllClick is called', () => {
      spyOn(component.toggleSelectAll, 'emit');
      component.onToggleSelectAllClick();
      expect(component.toggleSelectAll.emit).toHaveBeenCalled();
    });

    it('should emit resetPage when onResetPageClick is called', () => {
      spyOn(component.resetPage, 'emit');
      component.onResetPageClick();
      expect(component.resetPage.emit).toHaveBeenCalled();
    });

    it('should emit toggleClearAll when onToggleClearAlllClick is called', () => {
      spyOn(component.toggleClearAll, 'emit');
      component.onToggleClearAlllClick();
      expect(component.toggleClearAll.emit).toHaveBeenCalled();
    });
  });
});