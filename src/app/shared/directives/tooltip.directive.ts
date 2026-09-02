// src/app/shared/directives/tooltip.directive.ts
import { Directive, ElementRef, HostListener, Input, Renderer2, OnDestroy, inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private translate = inject(TranslateService);
  // 1. TÜM TİPLERİ KABUL EDİYORUZ: string, number, boolean, Date veya null/undefined
  @Input('appTooltip') text: any = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'right';
  @Input() tooltipIsActive = true;
  @Input() tooltipDateFormat: string = 'dd.MM.yyyy';
  private tooltipEl: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    // text null, undefined veya boş string ise tetikleme
    if (this.text === null || this.text === undefined || this.text === '' || !this.tooltipIsActive) return;

    this.tooltipEl = this.renderer.createElement('div');
    
    // 2. KRİTİK ALAN: Gelen veri tipini analiz edip string'e jilet gibi çeviriyoruz
    const formattedText = this.getFormattedText(this.text);
    
    // createText artık her zaman saf bir string alacağı için hata vermez!
    const textNode = this.renderer.createText(formattedText);
    this.renderer.appendChild(this.tooltipEl, textNode);

    // Stil ve konumlandırma tanımlamaların (Aynen korundu)
    this.renderer.setAttribute(
      this.tooltipEl,
      'class',
      'rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg whitespace-nowrap'
    );
    this.renderer.setStyle(this.tooltipEl, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipEl, 'z-index', '9999');
    this.renderer.appendChild(document.body, this.tooltipEl);

    const rect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipEl!.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (this.tooltipPosition) {
      case 'right':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + gap;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - gap;
        break;
      case 'top':
        top = rect.top - tooltipRect.height - gap;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
    }

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${left}px`);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.removeTooltip();
  }

  ngOnDestroy() {
    this.removeTooltip();
  }

  private removeTooltip() {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }

  /**
   * 3. MERKEZİ TİP FORMATLAYICI
   * Gelen verinin tipine göre kurumsal formatta string çıktı üretir.
   */
  private getFormattedText(value: any): string {
    // A. Eğer değer gerçek bir Date nesnesiyse
    if (value instanceof Date) {
      return formatDate(value, this.tooltipDateFormat, 'en-US');
    }

    // B. Eğer backend'den gelen ISO Date veya standart Date metnini içeriyorsa (RegEx kontrolü)
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const parsedDate = new Date(value);
      
      // Geçersiz bir tarih string'i ise koruma amacıyla String çıktısını dönüyoruz
      if (isNaN(parsedDate.getTime())) return value; 
      
      return formatDate(parsedDate, this.tooltipDateFormat, 'en-US');
    }

    // C. Eğer boolean bir durumsa
    if (typeof value === 'boolean') {
      return value ? this.translate.instant('Common.Active') : this.translate.instant('Common.Inactive');
    }

    // D. Diğer tüm tipler (string, number vb.)
    return String(value ?? '');
  }
}