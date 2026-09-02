// src/app/shared/components/table-empty-state/table-empty-state.component.ts
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  // tr[app-table-empty-state] seçicisi sayesinde <tbody> içinde doğrudan <tr> gibi render edilir
  selector: 'tr[app-table-empty-state]',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './table-empty-state.html',
  host: {
    // tr etiketinin sahip olacağı Tailwind sınıflarını host katmanına taşıyoruz
    'class': 'animate-[fadeIn_0.2s_ease-out]'
  }
})
export class TableEmptyStateComponent {
  // --- MODERN SIGNAL INPUTS ---
  // Varsayılan kurumsal değerleri içeriye fallback olarak gömüyoruz
  messageKey = input<string>('Label.NoRecords');
  descriptionKey = input<string>('Label.NoRecordDescription');
  iconClass = input<string>('bi-folder2-open');
}