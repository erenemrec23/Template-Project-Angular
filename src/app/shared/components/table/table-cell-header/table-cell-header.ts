import { Component, Input, Output, EventEmitter, HostListener, HostBinding, model, output, signal, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  FilterCondition,
  FilterConditionType,
  StringFilterConditions,
  NumberFilterConditions,
  DateFilterConditions,
  FilterConditionLabelKey,
} from '../../../../core/constants/filter-condition.enum';

export type FilterFieldType = 'text' | 'number' | 'date';

@Component({
  selector: 'th[appTableCellHeader]',
  standalone: true,
  templateUrl: './table-cell-header.html',
  imports: [FormsModule, TranslatePipe],
  host: {
    // align-top: iki satırlı başlıkta (label + inline input) etiketler üstte hizalansın
    'class': 'relative table-cell select-none p-2.5 align-top bg-slate-50 border-b border-slate-200 transition-colors duration-150',
    '[class.cursor-pointer]': 'sortable',
    '[class.hover:bg-slate-100]': 'sortable' // Sadece sortable iken hover efekti verir
  }
})
export class TableCellHeaderComponent implements OnInit {
  private translate = inject(TranslateService);

  // --- CONFIGURATION INPUTS ---
  @Input() sortable: boolean = true;    // Varsayılan: Sıralama aktif
  @Input() filterable: boolean = true;  // Varsayılan: Filtreleme aktif

  // --- SORT ---
  @Input() field!: string;
  @Input() labelKey!: string;
  @Input() currentSortField!: string;
  @Input() currentSortOrder!: 'asc' | 'desc' | '';
  @Output() sortChange = new EventEmitter<string>();

  // --- FILTER ---
  @Input() type: FilterFieldType = 'text';

  condition = model<FilterConditionType>(FilterCondition.Contains);
  value = model<string | number | null>('');
  value2 = model<string | number | null>(null);
  @Input() placeholderKey: string = this.translate.instant('Placeholder.Search');
  filterChange = output<void>();

  isOpen = signal<boolean>(false);
  PageFilterCondition = FilterCondition;
  FilterConditionLabelKey = FilterConditionLabelKey;

  availableConditions = computed<FilterConditionType[]>(() => {
    switch (this.type) {
      case 'number':
        return NumberFilterConditions;
      case 'date':
        return DateFilterConditions;
      default:
        return StringFilterConditions;
    }
  });

  isDateRange = computed<boolean>(() => this.type === 'date' && this.condition() === FilterCondition.Between);

  isValuelessCondition = computed<boolean>(() =>
    this.condition() === FilterCondition.IsEmpty || this.condition() === FilterCondition.IsNotEmpty
  );

  // --- WIDTH ---
  @Input() width?: string;

  @HostBinding('style.user-select') userSelect = 'none';
  @HostBinding('style.position') position = 'sticky';
@HostBinding('style.top') top = '0';
@HostBinding('style.z-index') zIndex = '10';

  @HostBinding('style.width') get hostWidth() {
    return this.width || 'auto';
  }

  @HostBinding('style.min-width') get hostMinWidth() {
    return this.width || 'auto';
  }

  @HostBinding('style.max-width') get hostMaxWidth() {
    return this.width ? this.width : 'none';
  }

  ngOnInit(): void {
    // Default koşul: text -> Contains, number/date -> Equals
    if (!this.availableConditions().includes(this.condition())) {
      this.condition.set(this.type === 'text' ? FilterCondition.Contains : FilterCondition.Equals);
    }
  }

  @HostListener('click')
  onSortClick(): void {
    // Sadece sortable true ise sıralama olayını dışarı fırlatır
    if (this.sortable) {
      this.sortChange.emit(this.field);
    }
  }

  toggleFilterOpen(event: Event): void {
    event.stopPropagation();
    // Sadece filterable true ise filtre panelini açar
    if (this.filterable) {
      this.isOpen.update(v => !v);
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:click')
  closeOnOutsideClick(): void {
    this.isOpen.set(false);
  }

  get hasActiveFilter(): boolean {
    if (!this.filterable) return false;

    const hasValue = (v: string | number | null | undefined): boolean =>
      v !== null && v !== undefined && v !== '';

    if (this.isValuelessCondition()) {
      return true;
    }

    if (this.isDateRange()) {
      return hasValue(this.value()) && hasValue(this.value2());
    }

    return hasValue(this.value());
  }

  onFilterValueChange(): void {
    if (this.isValuelessCondition()) {
      if (this.value() !== '') this.value.set('');
      if (this.value2() !== null) this.value2.set(null);
      this.filterChange.emit();
      return;
    }

    if (this.type === 'number' && this.value() !== null && this.value() !== '') {
      const num = Number(this.value());
      if (!isNaN(num)) {
        this.value.set(num);
      }
    }

    if (!this.isDateRange() && this.value2() !== null) {
      this.value2.set(null);
    }

    this.filterChange.emit();
  }

  resetFilter(event: Event): void {
    event.stopPropagation();

    this.value.set('');
    this.value2.set(null);
    this.condition.set(this.type === 'text' ? FilterCondition.Contains : FilterCondition.Equals);

    this.filterChange.emit();
    this.isOpen.set(false);
  }
}