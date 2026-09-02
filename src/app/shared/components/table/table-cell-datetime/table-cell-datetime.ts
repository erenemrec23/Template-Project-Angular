import { Component, input } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'td[app-table-cell-datetime], div[app-table-cell-datetime]',
  standalone: true,
  imports: [NgClass, DatePipe],
  template: `
    <span 
       
      tooltipPosition="right" 
      [ngClass]="customClass()"
      class="block truncate text-slate-700 max-w-full">
      {{ (value() | date: format()) || '-' }}
    </span>
  `,
  host: {
    'class': 'table-cell px-4 py-2 border-b border-slate-100 text-slate-600 align-middle'
  }
})
export class TableCellDateTimeComponent {
  // ISO Date / DateTimeOffset string veya Date objesi kabul eder
  value = input<string | Date | null | undefined>(null);
  
  // İsteğe bağlı özel format verilebilir (Varsayılan: dd.MM.yyyy HH:mm)
  format = input<string>('dd.MM.yyyy HH:mm');
  
  customClass = input<string>('');
}