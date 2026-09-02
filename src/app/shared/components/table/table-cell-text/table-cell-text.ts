import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { TooltipDirective } from '../../../directives/tooltip.directive';
export type TooltipPosition = 'left' | 'top' | 'bottom' | 'right';
@Component({
  // CRITICAL: Köşeli parantez kullanarak attribute selector haline getirdik
  selector: 'td[app-table-cell-text], div[app-table-cell-text]', 
  standalone: true,
  imports: [NgClass, TruncatePipe, TooltipDirective],
  templateUrl: './table-cell-text.html',
  host: {
    'class': 'table-cell px-4 py-2 border-b border-slate-100 text-slate-605 align-middle'
  }
  
})
export class TableCellTextComponent {
  text = input<string | number | null | undefined>('');
  limit = input<number>(50);
  customClass = input<string>('');
  tooltipPosition = input<TooltipPosition>('left');
  tooltip = input<string | null>(null);
}