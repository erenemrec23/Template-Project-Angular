// src/app/shared/components/generic-select/generic-select.component.ts
import { Component, input, model, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SelectItem } from './select-item.model';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [],
  templateUrl: './select.html'
})
export class SelectComponent {
  private translate = inject(TranslateService);

  // Angular 21 İki yönlü model sinyali (Seçilen ID'yi üst komponente paslar)
  value = model<string | number>('');

  // Dışarıdan doldurulacak veri listesi sinyali
  items = input.required<SelectItem[]>();

  // Konfigürasyon Sinyalleri (Dinamik anahtar eşlemeleri)
  labelKey = input<string>('name'); // Ekranda görünecek alan (Örn: 'name', 'title')
  valueKey = input<string>('id');   // Arka planda tutulacak alan (Örn: 'id', 'code')
  
  // Dil ve Placeholder Sinyalleri
  labelTitle = input<string>('Label.SelectItem'); // Selectbox üstündeki başlık
  placeholder = input<string>('Label.ChoosePlaceholder'); // Lütfen seçiniz yazısı
  isRequired = input<boolean>(true);
  isDisabled = input<boolean>(false);

  t(key: string): string {
    return this.translate.instant(key);
  }

  onSelectChange(event: Event): void {
    const targetValue = (event.target as HTMLInputElement).value;
    this.value.set(targetValue);
  }
}