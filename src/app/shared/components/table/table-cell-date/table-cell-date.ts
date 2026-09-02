import { Component, input, computed } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'td[app-table-cell-date], div[app-table-cell-date]',
  standalone: true,
  imports: [NgClass],
  template: `
    <span  
      tooltipPosition="right" 
      [ngClass]="customClass()"
      class="block truncate text-slate-700 max-w-full">
      {{ formattedValue() || '-' }}
    </span>
  `,
  host: {
    'class': 'table-cell px-4 py-2 border-b border-slate-100 text-slate-600 align-middle'
  }
})
export class TableCellDateComponent {
  // ISO DateTimeOffset string, Date veya null/undefined kabul eder
  value = input<string | Date | null | undefined>(null);
  
  // Varsayılan format (İstenirse dışarıdan override edilebilir)
  format = input<string>('dd.MM.yyyy');
  
  customClass = input<string>('');

  private datePipe = new DatePipe('en-US');

  // Güvenli dönüşüm yapan computed signal
  formattedValue = computed(() => {
    const val = this.value();
    if (!val) return '';
    
    try {
      const dateObj = typeof val === 'string' ? new Date(val) : val;
      return this.datePipe.transform(dateObj, this.format()) ?? '';
    } catch {
      return '';
    }
  });
}