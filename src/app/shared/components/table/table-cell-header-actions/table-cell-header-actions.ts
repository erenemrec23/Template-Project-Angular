import { Component, Input, inject, HostBinding } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'th[appTableCellHeaderActions]', // Yeni özel seçicimiz
  standalone: true,
  templateUrl: './table-cell-header-actions.html' 
})
export class TableCellHeaderActionsComponent {
  private translate = inject(TranslateService);

  // --- VARSAYILAN DEĞERLER (DEFAULT VALUES) ---
  // Dışarıdan ezilmediği (override edilmediği) sürece bu değerler geçerli olur.
  @Input() labelKey: string = 'Label.Actions'; 
  
  @Input() @HostBinding('style.width') width: string = '50px';
  
  // İşlemler kolonu genelde ortalı (center) durduğu için varsayılanı değiştirdik
  @Input() @HostBinding('style.text-align') textAlign: string = 'center';

  t(key: string): string {
    return this.translate.instant(key);
  }
}