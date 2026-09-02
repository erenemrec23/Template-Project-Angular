import { Component, Input, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  // DİKKAT: Köşeli parantez içindeki bu kullanım, bileşeni bir etiket değil
  // bir özellik (attribute) olarak kullanmamızı sağlar.
  selector: '[appTableCellEmptyState]', 
  standalone: true,
  templateUrl: './table-cell-empty-state.html',
  styleUrls: ['./table-cell-empty-state.css']
})
export class TableCellEmptyStateComponent {
  private translate = inject(TranslateService);

  // Parent bileşenden gelecek dinamik veriler (Varsayılan değerleri atıyoruz)
  @Input() colspan: number | string = 100; // 100 yazmak tüm kolonları otomatik kaplatır
  @Input() messageKey: string = 'Label.NoRecords';
  @Input() iconClass: string = 'bi-inbox'; // Varsayılan Bootstrap ikonu

  t(key: string): string {
    return this.translate.instant(key);
  }
}