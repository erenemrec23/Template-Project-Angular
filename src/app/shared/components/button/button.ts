// src/app/shared/components/button/button.ts
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TooltipDirective } from '../../directives/tooltip.directive';

// TooltipDirective.tooltipPosition ile ayni union. Directive bu tipi export
// ediyorsa oradan import etmek daha iyi (tek kaynak): 
//   import { TooltipPosition } from '../../directives/tooltip.directive';
type TooltipPosition = 'bottom' | 'top' | 'left' | 'right';


const BASE_CLASSES =
  'cursor-pointer font-medium h-8 px-4 rounded-md border-0 text-[0.95rem] ' +
  'transition-all duration-200 inline-flex items-center justify-center gap-2 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none ' +
  'disabled:shadow-none disabled:transform-none';

/**
 * variantClass() input'una göre eklenecek ek Tailwind class'ları.
 * Eski CSS'teki .btn-add, .btn-refresh vb. kuralların karşılığı.
 */
const VARIANT_CLASSES: Record<string, string> = {
  'btn-add':
    'bg-red-600 text-white px-5 font-semibold rounded-lg ' +
    'shadow-[0_4px_12px_rgba(224,49,49,0.15)] ' +
    'hover:bg-red-700 hover:-translate-y-px',

  'btn-default':
    'bg-slate-100 text-slate-600 border border-slate-200 font-semibold rounded-lg ' +
    'hover:bg-slate-200 hover:text-slate-900',

  'btn-refresh':
    'bg-slate-100 text-slate-600 border border-slate-200 font-semibold rounded-lg ' +
    'hover:bg-slate-200 hover:text-slate-900',

  'btn-excel':
    'bg-emerald-500 text-white border border-emerald-600 ' +
    'hover:bg-emerald-600',

  'btn-excel-import':
    'bg-teal-600 text-white border border-teal-700 ' +
    'hover:bg-teal-700',

  // Satır içi yuvarlak ikon butonları (grid/table actions)
  'btn-shared-edit':
    'w-[38px] h-[38px] !p-0 !rounded-full !text-[1.1rem] ' +
    'bg-slate-100 text-slate-700 ' +
    'hover:bg-slate-200 hover:text-slate-900',

  'btn-shared-qr':
    'w-[38px] h-[38px] !p-0 !rounded-full !text-[1.1rem] ' +
    'bg-red-50 text-red-600 border border-red-100 ' +
    'hover:bg-red-600 hover:text-white hover:shadow-[0_4px_12px_rgba(224,49,49,0.2)]',

  'btn-cancel':
    'bg-slate-100 text-slate-600 rounded-lg font-semibold ' +
    'hover:bg-slate-200 hover:text-slate-900',

  'btn-submit':
    'bg-red-600 text-white py-2.5 px-6 rounded-lg font-semibold ' +
    'shadow-[0_4px_12px_rgba(224,49,49,0.15)] hover:bg-red-700',

  'btn-manage-perms':
    'bg-amber-50 text-amber-700 border border-amber-200 font-semibold rounded-lg ' +
    'hover:bg-amber-100 hover:text-amber-800 transition-colors',

  'btn-back':
    'bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg ' +
    'hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-xs',

  'btn-edit':
    'bg-white text-blue-600 border border-blue-200 font-semibold rounded-md ' +
    'hover:bg-blue-50 hover:border-blue-300 transition-colors',
};

@Component({
  selector: 'app-shared-button',
  standalone: true,
  imports: [RouterLink, TooltipDirective],
  templateUrl: './button.html',
  // styleUrls kaldırıldı: tüm görünüm artık Tailwind utility class'ları ile sağlanıyor.
})
export class SharedButtonComponent {
  // Girdiler (Signal Inputs)
  text = input<string>('');
  icon = input<string | null>(null);
  variantClass = input<string>(''); // Örn: 'btn-refresh', 'btn-add', 'btn-excel'
  // Variant sistemine girmeyen, cagrildigi yere ozel ek Tailwind class'lari.
  // (Ornegin sidebar gibi koyu temali, tam-genislik butonlar icin.)
  extraClass = input<string>('');
  visible = input<boolean>(true);
  type = input<string>('button');
  disabled = input<boolean>(false);
  spin = input<boolean>(false);

  // RouterLink ve Tooltip Özellikleri
  routerLink = input<string | any[] | null>(null);
  queryParams = input<Record<string, any> | null>(null);
  tooltipText = input<string>('');
  tooltipPosition = input<TooltipPosition>('bottom');

  // Dışarıya açılan click event'i (signal-based output)
  buttonClick = output<MouseEvent>();

  /**
   * Base + variant + extraClass'larını birleştirip template'e tek string olarak sunar.
   * extraClass en sona eklenir; gerektiginde base geometrisini `!` ile override edebilir.
   */
  buttonClasses = computed(() => {
    const variant = VARIANT_CLASSES[this.variantClass()] ?? '';
    return `${BASE_CLASSES} ${variant} ${this.extraClass()}`.trim().replace(/\s+/g, ' ');
  });

  onClick(event: MouseEvent): void {
    if (this.disabled()) return;
    this.buttonClick.emit(event);
  }
}