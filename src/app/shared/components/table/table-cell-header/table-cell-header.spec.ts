import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellHeaderComponent, FilterFieldType } from './table-cell-header';
import {
  FilterCondition,
  StringFilterConditions,
  NumberFilterConditions,
  DateFilterConditions,
} from '../../../../core/constants/filter-condition.enum';

describe('TableCellHeaderComponent', () => {
  let fixture: ComponentFixture<TableCellHeaderComponent>;
  let component: TableCellHeaderComponent;

  /**
   * Yeni bir fixture oluşturur, zorunlu inputları set eder ve isteğe bağlı olarak
   * `type` ve `width` inputlarını da uygulayıp ilk change detection'ı (ngOnInit dahil)
   * tetikler.
   */
  function createFixture(config: { type?: FilterFieldType; width?: string } = {}): ComponentFixture<TableCellHeaderComponent> {
    const f = TestBed.createComponent(TableCellHeaderComponent);
    f.componentRef.setInput('field', 'name');
    f.componentRef.setInput('labelKey', 'Label.Name');
    f.componentRef.setInput('currentSortField', '');
    f.componentRef.setInput('currentSortOrder', '');
    if (config.type) {
      f.componentRef.setInput('type', config.type);
    }
    if (config.width) {
      f.componentRef.setInput('width', config.width);
    }
    f.detectChanges();
    return f;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCellHeaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = createFixture();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sorting', () => {
    it('emits sortChange with the field name when the host is clicked', () => {
      spyOn(component.sortChange, 'emit');

      component.onSortClick();

      expect(component.sortChange.emit).toHaveBeenCalledWith('name');
    });
  });

  describe('filter panel açma/kapama', () => {
    it('başlangıçta kapalıdır', () => {
      expect(component.isOpen()).toBeFalse();
    });

    it('toggleFilterOpen her çağrıda isOpen değerini tersine çevirir ve propagation durdurur', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.toggleFilterOpen(event);
      expect(component.isOpen()).toBeTrue();
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);

      component.toggleFilterOpen(event);
      expect(component.isOpen()).toBeFalse();
    });

    it('stopPropagation, event.stopPropagation() çağırır', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.stopPropagation(event);

      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    });

    it('closeOnOutsideClick isOpen değerini false yapar', () => {
      component.isOpen.set(true);

      component.closeOnOutsideClick();

      expect(component.isOpen()).toBeFalse();
    });
  });

  describe('availableConditions (alan tipine göre koşul listesi)', () => {
    it('text tipi için StringFilterConditions döner', () => {
      const f = createFixture({ type: 'text' });
      expect(f.componentInstance.availableConditions()).toEqual(StringFilterConditions);
    });

    it('number tipi için NumberFilterConditions döner', () => {
      const f = createFixture({ type: 'number' });
      expect(f.componentInstance.availableConditions()).toEqual(NumberFilterConditions);
    });

    it('date tipi için DateFilterConditions döner (Between dahil)', () => {
      const f = createFixture({ type: 'date' });
      expect(f.componentInstance.availableConditions()).toEqual(DateFilterConditions);
      expect(f.componentInstance.availableConditions()).toContain(FilterCondition.Between);
    });
  });

  describe('ngOnInit - varsayılan koşul seçimi', () => {
    it('text tipinde varsayılan koşul (Contains) korunur', () => {
      const f = createFixture({ type: 'text' });
      expect(f.componentInstance.condition()).toBe(FilterCondition.Contains);
    });

    it('number tipinde desteklenmeyen varsayılan koşul Equals\'a resetlenir', () => {
      const f = createFixture({ type: 'number' });
      expect(f.componentInstance.condition()).toBe(FilterCondition.Equals);
    });

    it('date tipinde desteklenmeyen varsayılan koşul Equals\'a resetlenir', () => {
      const f = createFixture({ type: 'date' });
      expect(f.componentInstance.condition()).toBe(FilterCondition.Equals);
    });
  });

  describe('isDateRange', () => {
    it('type date değilse Between koşulu seçili olsa bile false döner', () => {
      const f = createFixture({ type: 'text' });
      f.componentInstance.condition.set(FilterCondition.Between);
      expect(f.componentInstance.isDateRange()).toBeFalse();
    });

    it('type date ve koşul Equals ise false döner', () => {
      const f = createFixture({ type: 'date' });
      expect(f.componentInstance.isDateRange()).toBeFalse();
    });

    it('type date ve koşul Between ise true döner', () => {
      const f = createFixture({ type: 'date' });
      f.componentInstance.condition.set(FilterCondition.Between);
      expect(f.componentInstance.isDateRange()).toBeTrue();
    });
  });

  describe('onFilterValueChange - number dönüşümü', () => {
    it('geçerli sayısal string değeri number\'a çevirir', () => {
      const f = createFixture({ type: 'number' });
      const c = f.componentInstance;
      c.value.set('42');

      c.onFilterValueChange();

      expect(c.value()).toBe(42);
    });

    it('geçersiz sayısal değeri olduğu gibi bırakır', () => {
      const f = createFixture({ type: 'number' });
      const c = f.componentInstance;
      c.value.set('abc');

      c.onFilterValueChange();

      expect(c.value()).toBe('abc');
    });

    it('text tipinde değeri dönüştürmeden bırakır', () => {
      const f = createFixture({ type: 'text' });
      const c = f.componentInstance;
      c.value.set('istanbul');

      c.onFilterValueChange();

      expect(c.value()).toBe('istanbul');
    });
  });

  describe('onFilterValueChange - date range (value2) temizleme', () => {
    it('Between dışına geçildiğinde value2\'yi null\'a resetler', () => {
      const f = createFixture({ type: 'date' });
      const c = f.componentInstance;

      c.condition.set(FilterCondition.Between);
      c.value2.set('2024-02-01');

      c.condition.set(FilterCondition.Equals);
      c.onFilterValueChange();

      expect(c.value2()).toBeNull();
    });

    it('Between koşulundayken value2\'yi korur', () => {
      const f = createFixture({ type: 'date' });
      const c = f.componentInstance;

      c.condition.set(FilterCondition.Between);
      c.value2.set('2024-02-01');

      c.onFilterValueChange();

      expect(c.value2()).toBe('2024-02-01');
    });
  });

  describe('onFilterValueChange - filterChange emit', () => {
    it('her çağrıda filterChange event\'ini tetikler', () => {
      spyOn(component.filterChange, 'emit');

      component.onFilterValueChange();

      expect(component.filterChange.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasActiveFilter', () => {
    it('value boşken false döner (text/number)', () => {
      const f = createFixture({ type: 'text' });
      f.componentInstance.value.set('');
      expect(f.componentInstance.hasActiveFilter).toBeFalse();
    });

    it('value doluyken true döner (text)', () => {
      const f = createFixture({ type: 'text' });
      f.componentInstance.value.set('ankara');
      expect(f.componentInstance.hasActiveFilter).toBeTrue();
    });

    it('number tipinde 0 değeri bile aktif filtre sayılır', () => {
      const f = createFixture({ type: 'number' });
      f.componentInstance.value.set(0);
      expect(f.componentInstance.hasActiveFilter).toBeTrue();
    });

    it('date tipinde Equals koşulunda sadece value doluysa true döner', () => {
      const f = createFixture({ type: 'date' });
      f.componentInstance.value.set('2024-01-01');
      expect(f.componentInstance.hasActiveFilter).toBeTrue();
    });

    it('date tipinde Between koşulunda sadece value doluysa (value2 boş) false döner', () => {
      const f = createFixture({ type: 'date' });
      const c = f.componentInstance;
      c.condition.set(FilterCondition.Between);
      c.value.set('2024-01-01');

      expect(c.hasActiveFilter).toBeFalse();
    });

    it('date tipinde Between koşulunda hem value hem value2 doluysa true döner', () => {
      const f = createFixture({ type: 'date' });
      const c = f.componentInstance;
      c.condition.set(FilterCondition.Between);
      c.value.set('2024-01-01');
      c.value2.set('2024-01-31');

      expect(c.hasActiveFilter).toBeTrue();
    });
  });

  describe('kolon genişliği host bindingleri', () => {
    it('width verilmediğinde auto/auto/none döner', () => {
      const f = createFixture();
      expect(f.componentInstance.hostWidth).toBe('auto');
      expect(f.componentInstance.hostMinWidth).toBe('auto');
      expect(f.componentInstance.hostMaxWidth).toBe('none');
    });

    it('width verildiğinde üç binding de o değeri döner', () => {
      const f = createFixture({ width: '160px' });
      expect(f.componentInstance.hostWidth).toBe('160px');
      expect(f.componentInstance.hostMinWidth).toBe('160px');
      expect(f.componentInstance.hostMaxWidth).toBe('160px');
    });
  });
});